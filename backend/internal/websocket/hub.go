package websocket

import (
	"sync"

	"github.com/google/uuid"
)

// Hub maintains the set of active clients and broadcasts messages to them
type Hub struct {
	// Registered clients mapped by user ID
	clients map[uuid.UUID]map[*Client]bool

	// Clients by conversation ID for efficient broadcasting
	conversations map[uuid.UUID]map[*Client]bool

	// Register requests from clients
	register chan *Client

	// Unregister requests from clients
	unregister chan *Client

	// Broadcast message to specific conversation participants
	broadcast chan *BroadcastMessage

	// Presence updates
	presence chan *PresenceUpdate

	// Mutex for thread-safe operations
	mu sync.RWMutex

	// Online users callback (for database updates)
	onPresenceChange func(userID uuid.UUID, isOnline bool)
}

// BroadcastMessage represents a message to be broadcast to conversation participants
type BroadcastMessage struct {
	ConversationID uuid.UUID
	SenderID       uuid.UUID
	Message        []byte
	ExcludeSender  bool
}

// PresenceUpdate represents a user presence change
type PresenceUpdate struct {
	UserID   uuid.UUID
	IsOnline bool
}

// NewHub creates a new Hub instance
func NewHub() *Hub {
	return &Hub{
		clients:       make(map[uuid.UUID]map[*Client]bool),
		conversations: make(map[uuid.UUID]map[*Client]bool),
		register:      make(chan *Client),
		unregister:    make(chan *Client),
		broadcast:     make(chan *BroadcastMessage, 256),
		presence:      make(chan *PresenceUpdate, 64),
	}
}

// SetPresenceCallback sets the callback for presence changes
func (h *Hub) SetPresenceCallback(callback func(userID uuid.UUID, isOnline bool)) {
	h.onPresenceChange = callback
}

// Run starts the hub's main loop
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.registerClient(client)
		case client := <-h.unregister:
			h.unregisterClient(client)
		case message := <-h.broadcast:
			h.broadcastToConversation(message)
		case update := <-h.presence:
			h.handlePresenceUpdate(update)
		}
	}
}

// registerClient adds a client to the hub
func (h *Hub) registerClient(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	// Add to user's clients
	if h.clients[client.userID] == nil {
		h.clients[client.userID] = make(map[*Client]bool)
		// User just came online
		if h.onPresenceChange != nil {
			go h.onPresenceChange(client.userID, true)
		}
	}
	h.clients[client.userID][client] = true
}

// unregisterClient removes a client from the hub
func (h *Hub) unregisterClient(client *Client) {
	h.mu.Lock()
	defer h.mu.Unlock()

	// Remove from user's clients
	if clients, ok := h.clients[client.userID]; ok {
		if _, exists := clients[client]; exists {
			delete(clients, client)
			close(client.send)

			// If no more clients for this user, they're offline
			if len(clients) == 0 {
				delete(h.clients, client.userID)
				if h.onPresenceChange != nil {
					go h.onPresenceChange(client.userID, false)
				}
			}
		}
	}

	// Remove from all conversations
	for convID, clients := range h.conversations {
		if _, ok := clients[client]; ok {
			delete(clients, client)
			if len(clients) == 0 {
				delete(h.conversations, convID)
			}
		}
	}
}

// JoinConversation adds a client to a conversation
func (h *Hub) JoinConversation(client *Client, conversationID uuid.UUID) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if h.conversations[conversationID] == nil {
		h.conversations[conversationID] = make(map[*Client]bool)
	}
	h.conversations[conversationID][client] = true
	client.conversations[conversationID] = true
}

// LeaveConversation removes a client from a conversation
func (h *Hub) LeaveConversation(client *Client, conversationID uuid.UUID) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if clients, ok := h.conversations[conversationID]; ok {
		delete(clients, client)
		if len(clients) == 0 {
			delete(h.conversations, conversationID)
		}
	}
	delete(client.conversations, conversationID)
}

// broadcastToConversation sends a message to all participants in a conversation
func (h *Hub) broadcastToConversation(msg *BroadcastMessage) {
	h.mu.RLock()
	clients := h.conversations[msg.ConversationID]
	h.mu.RUnlock()

	for client := range clients {
		if msg.ExcludeSender && client.userID == msg.SenderID {
			continue
		}
		select {
		case client.send <- msg.Message:
		default:
			// Client's send buffer is full, remove them
			go func(c *Client) {
				h.unregister <- c
			}(client)
		}
	}
}

// BroadcastToUser sends a message to all connections of a specific user
func (h *Hub) BroadcastToUser(userID uuid.UUID, message []byte) {
	h.mu.RLock()
	clients := h.clients[userID]
	h.mu.RUnlock()

	for client := range clients {
		select {
		case client.send <- message:
		default:
			go func(c *Client) {
				h.unregister <- c
			}(client)
		}
	}
}

// BroadcastToConversation broadcasts a message to conversation participants
func (h *Hub) BroadcastToConversation(conversationID, senderID uuid.UUID, message []byte, excludeSender bool) {
	h.broadcast <- &BroadcastMessage{
		ConversationID: conversationID,
		SenderID:       senderID,
		Message:        message,
		ExcludeSender:  excludeSender,
	}
}

// handlePresenceUpdate processes presence updates
func (h *Hub) handlePresenceUpdate(update *PresenceUpdate) {
	// Notify all users who have conversations with this user
	// This is handled by the presence callback set during initialization
}

// IsUserOnline checks if a user has any active connections
func (h *Hub) IsUserOnline(userID uuid.UUID) bool {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients[userID]) > 0
}

// GetOnlineUsers returns a list of online user IDs from a given set
func (h *Hub) GetOnlineUsers(userIDs []uuid.UUID) []uuid.UUID {
	h.mu.RLock()
	defer h.mu.RUnlock()

	online := make([]uuid.UUID, 0)
	for _, id := range userIDs {
		if len(h.clients[id]) > 0 {
			online = append(online, id)
		}
	}
	return online
}

// GetConversationParticipantIDs returns the user IDs of all connected participants in a conversation
func (h *Hub) GetConversationParticipantIDs(conversationID uuid.UUID) []uuid.UUID {
	h.mu.RLock()
	defer h.mu.RUnlock()

	seen := make(map[uuid.UUID]bool)
	var userIDs []uuid.UUID

	if clients, ok := h.conversations[conversationID]; ok {
		for client := range clients {
			if !seen[client.userID] {
				seen[client.userID] = true
				userIDs = append(userIDs, client.userID)
			}
		}
	}
	return userIDs
}

// Register adds a client to the hub (called from client)
func (h *Hub) Register(client *Client) {
	h.register <- client
}

// Unregister removes a client from the hub (called from client)
func (h *Hub) Unregister(client *Client) {
	h.unregister <- client
}

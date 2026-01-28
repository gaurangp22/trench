package websocket

import (
	"encoding/json"
	"log"
	"time"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

const (
	// Time allowed to write a message to the peer
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer
	pongWait = 60 * time.Second

	// Send pings to peer with this period (must be less than pongWait)
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer
	maxMessageSize = 65536
)

// Client represents a single WebSocket connection
type Client struct {
	hub *Hub

	// The WebSocket connection
	conn *websocket.Conn

	// User ID associated with this connection
	userID uuid.UUID

	// Buffered channel of outbound messages
	send chan []byte

	// Conversations this client is subscribed to
	conversations map[uuid.UUID]bool

	// Message handler for processing incoming JSON-RPC messages
	messageHandler func(client *Client, message []byte)
}

// NewClient creates a new Client instance
func NewClient(hub *Hub, conn *websocket.Conn, userID uuid.UUID, messageHandler func(*Client, []byte)) *Client {
	return &Client{
		hub:            hub,
		conn:           conn,
		userID:         userID,
		send:           make(chan []byte, 256),
		conversations:  make(map[uuid.UUID]bool),
		messageHandler: messageHandler,
	}
}

// UserID returns the user ID associated with this client
func (c *Client) UserID() uuid.UUID {
	return c.userID
}

// Send sends a message to the client
func (c *Client) Send(message []byte) {
	select {
	case c.send <- message:
	default:
		// Buffer full, client will be disconnected
	}
}

// SendJSON marshals and sends a JSON message
func (c *Client) SendJSON(v interface{}) error {
	data, err := json.Marshal(v)
	if err != nil {
		return err
	}
	c.Send(data)
	return nil
}

// ReadPump pumps messages from the WebSocket connection to the hub
func (c *Client) ReadPump() {
	defer func() {
		c.hub.Unregister(c)
		c.conn.Close()
	}()

	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("websocket error: %v", err)
			}
			break
		}

		// Handle the message
		if c.messageHandler != nil {
			c.messageHandler(c, message)
		}
	}
}

// WritePump pumps messages from the hub to the WebSocket connection
func (c *Client) WritePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The hub closed the channel
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// Add queued messages to the current WebSocket message
			n := len(c.send)
			for i := 0; i < n; i++ {
				w.Write([]byte{'\n'})
				w.Write(<-c.send)
			}

			if err := w.Close(); err != nil {
				return
			}
		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// Start starts the client's read and write pumps
func (c *Client) Start() {
	c.hub.Register(c)
	go c.WritePump()
	go c.ReadPump()
}

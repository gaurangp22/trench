package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/trenchjob/backend/internal/config"
	"github.com/trenchjob/backend/internal/handler"
	"github.com/trenchjob/backend/internal/middleware"
	"github.com/trenchjob/backend/internal/pkg/database"
	"github.com/trenchjob/backend/internal/pkg/utils"
	"github.com/trenchjob/backend/internal/repository/postgres"
	"github.com/trenchjob/backend/internal/service"
)

func main() {
	// Load configuration
	cfg := config.Load()

	log.Printf("Starting TrenchJobs API server on port %s...", cfg.Server.Port)
	log.Printf("Environment: %s", cfg.Server.Env)
	log.Printf("Solana Network: %s", cfg.Solana.Network)

	// Connect to database
	db, err := database.NewPostgresDB(cfg.Database)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()
	log.Println("Connected to PostgreSQL database")

	// Initialize JWT manager
	jwtManager := utils.NewJWTManager(cfg.JWT.Secret, cfg.JWT.ExpireHours)

	// Initialize repositories
	userRepo := postgres.NewUserRepository(db.Pool)
	walletRepo := postgres.NewWalletRepository(db.Pool)
	sessionRepo := postgres.NewSessionRepository(db.Pool)
	profileRepo := postgres.NewProfileRepository(db.Pool)
	skillRepo := postgres.NewSkillRepository(db.Pool)
	portfolioRepo := postgres.NewPortfolioRepository(db.Pool)
	socialRepo := postgres.NewSocialRepository(db.Pool)
	tokenWorkRepo := postgres.NewTokenWorkRepository(db.Pool)
	jobRepo := postgres.NewJobRepository(db.Pool)
	proposalRepo := postgres.NewProposalRepository(db.Pool)
	contractRepo := postgres.NewContractRepository(db.Pool)
	milestoneRepo := postgres.NewMilestoneRepository(db.Pool)
	escrowRepo := postgres.NewEscrowRepository(db.Pool)
	paymentRepo := postgres.NewPaymentRepository(db.Pool)
	reviewRepo := postgres.NewReviewRepository(db.Pool)
	notificationRepo := postgres.NewNotificationRepository(db.Pool)
	conversationRepo := postgres.NewConversationRepository(db.Pool)
	messageRepo := postgres.NewMessageRepository(db.Pool)

	// Initialize services
	authService := service.NewAuthService(userRepo, walletRepo, sessionRepo, profileRepo, jwtManager)
	profileService := service.NewProfileService(profileRepo, skillRepo, portfolioRepo, userRepo, socialRepo, tokenWorkRepo)
	jobService := service.NewJobService(jobRepo, proposalRepo, userRepo)
	contractService := service.NewContractService(
		contractRepo, milestoneRepo, escrowRepo, paymentRepo,
		proposalRepo, jobRepo, userRepo,
	)
	reviewService := service.NewReviewService(reviewRepo, notificationRepo, contractRepo, userRepo)
	notificationService := service.NewNotificationService(notificationRepo)
	messageService := service.NewMessageService(conversationRepo, messageRepo, userRepo, contractRepo, profileRepo)

	// Initialize handlers
	authHandler := handler.NewAuthHandler(authService)
	profileHandler := handler.NewProfileHandler(profileService)
	jobHandler := handler.NewJobHandler(jobService)
	contractHandler := handler.NewContractHandler(contractService)
	reviewHandler := handler.NewReviewHandler(reviewService)
	notificationHandler := handler.NewNotificationHandler(notificationService)
	messageHandler := handler.NewMessageHandler(messageService)

	// Upload handler - stores files in ./uploads directory
	uploadDir := "./uploads"
	baseURL := "http://localhost:" + cfg.Server.Port
	uploadHandler := handler.NewUploadHandler(uploadDir, baseURL)

	// Initialize middleware
	authMiddleware := middleware.NewAuthMiddleware(jwtManager)
	corsConfig := middleware.DefaultCORSConfig()

	// Setup router
	mux := http.NewServeMux()

	// Health check
	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status": "healthy", "service": "trenchjob-api"}`))
	})

	// Auth routes (public)
	mux.HandleFunc("POST /api/v1/auth/signup", authHandler.Signup)
	mux.HandleFunc("POST /api/v1/auth/login", authHandler.Login)
	mux.HandleFunc("GET /api/v1/wallet/nonce", authHandler.GetNonce)
	mux.HandleFunc("POST /api/v1/auth/login/wallet", authHandler.WalletLogin)

	// Auth routes (protected)
	mux.Handle("POST /api/v1/auth/logout", authMiddleware.Authenticate(http.HandlerFunc(authHandler.Logout)))
	mux.Handle("POST /api/v1/auth/refresh", authMiddleware.Authenticate(http.HandlerFunc(authHandler.RefreshToken)))
	mux.Handle("POST /api/v1/wallet/connect", authMiddleware.Authenticate(http.HandlerFunc(authHandler.ConnectWallet)))
	mux.Handle("GET /api/v1/wallet/me", authMiddleware.Authenticate(http.HandlerFunc(authHandler.GetWallets)))
	mux.Handle("DELETE /api/v1/wallet", authMiddleware.Authenticate(http.HandlerFunc(authHandler.DisconnectWallet)))

	// Profile routes (public)
	mux.HandleFunc("GET /api/v1/profiles", profileHandler.SearchProfiles)
	mux.HandleFunc("GET /api/v1/profiles/{id}", profileHandler.GetProfile)
	mux.HandleFunc("GET /api/v1/skills", profileHandler.GetAllSkills)

	// Profile routes (protected)
	mux.Handle("GET /api/v1/profile", authMiddleware.Authenticate(http.HandlerFunc(profileHandler.GetMyProfile)))
	mux.Handle("PUT /api/v1/profile", authMiddleware.Authenticate(http.HandlerFunc(profileHandler.UpdateProfile)))
	mux.Handle("PUT /api/v1/profile/skills", authMiddleware.Authenticate(http.HandlerFunc(profileHandler.SetProfileSkills)))
	mux.Handle("POST /api/v1/profile/skills", authMiddleware.Authenticate(http.HandlerFunc(profileHandler.AddProfileSkill)))
	mux.Handle("DELETE /api/v1/profile/skills/{id}", authMiddleware.Authenticate(http.HandlerFunc(profileHandler.RemoveProfileSkill)))
	mux.Handle("POST /api/v1/profile/portfolio", authMiddleware.Authenticate(http.HandlerFunc(profileHandler.CreatePortfolioItem)))
	mux.Handle("PUT /api/v1/profile/portfolio/{id}", authMiddleware.Authenticate(http.HandlerFunc(profileHandler.UpdatePortfolioItem)))
	mux.Handle("DELETE /api/v1/profile/portfolio/{id}", authMiddleware.Authenticate(http.HandlerFunc(profileHandler.DeletePortfolioItem)))

	// Profile socials routes (protected)
	mux.Handle("GET /api/v1/profile/socials", authMiddleware.Authenticate(http.HandlerFunc(profileHandler.GetSocials)))
	mux.Handle("PUT /api/v1/profile/socials", authMiddleware.Authenticate(http.HandlerFunc(profileHandler.SetSocials)))

	// Profile token work routes (protected)
	mux.Handle("GET /api/v1/profile/token-work", authMiddleware.Authenticate(http.HandlerFunc(profileHandler.GetTokenWork)))
	mux.Handle("POST /api/v1/profile/token-work", authMiddleware.Authenticate(http.HandlerFunc(profileHandler.CreateTokenWork)))
	mux.Handle("PUT /api/v1/profile/token-work/{id}", authMiddleware.Authenticate(http.HandlerFunc(profileHandler.UpdateTokenWork)))
	mux.Handle("DELETE /api/v1/profile/token-work/{id}", authMiddleware.Authenticate(http.HandlerFunc(profileHandler.DeleteTokenWork)))

	// Job routes (protected - client) - Register specific routes FIRST
	mux.Handle("GET /api/v1/jobs/mine", authMiddleware.Authenticate(http.HandlerFunc(jobHandler.GetMyJobs)))
	mux.Handle("POST /api/v1/jobs", authMiddleware.Authenticate(http.HandlerFunc(jobHandler.CreateJob)))
	mux.Handle("PUT /api/v1/jobs/{id}", authMiddleware.Authenticate(http.HandlerFunc(jobHandler.UpdateJob)))
	mux.Handle("DELETE /api/v1/jobs/{id}", authMiddleware.Authenticate(http.HandlerFunc(jobHandler.DeleteJob)))

	// Job routes (public) - Generic routes AFTER specific ones
	mux.HandleFunc("GET /api/v1/jobs", jobHandler.SearchJobs)
	mux.HandleFunc("GET /api/v1/jobs/{id}", jobHandler.GetJob)
	mux.Handle("POST /api/v1/jobs/{id}/publish", authMiddleware.Authenticate(http.HandlerFunc(jobHandler.PublishJob)))
	mux.Handle("POST /api/v1/jobs/{id}/close", authMiddleware.Authenticate(http.HandlerFunc(jobHandler.CloseJob)))
	mux.Handle("GET /api/v1/jobs/{id}/proposals", authMiddleware.Authenticate(http.HandlerFunc(jobHandler.GetJobProposals)))

	// Proposal routes (protected) - Specific routes FIRST
	mux.Handle("GET /api/v1/proposals/mine", authMiddleware.Authenticate(http.HandlerFunc(jobHandler.GetMyProposals)))
	mux.Handle("POST /api/v1/jobs/{id}/proposals", authMiddleware.Authenticate(http.HandlerFunc(jobHandler.SubmitProposal)))
	mux.Handle("GET /api/v1/proposals/{id}", authMiddleware.Authenticate(http.HandlerFunc(jobHandler.GetProposal)))
	mux.Handle("DELETE /api/v1/proposals/{id}", authMiddleware.Authenticate(http.HandlerFunc(jobHandler.WithdrawProposal)))
	mux.Handle("POST /api/v1/proposals/{id}/shortlist", authMiddleware.Authenticate(http.HandlerFunc(jobHandler.ShortlistProposal)))
	mux.Handle("POST /api/v1/proposals/{id}/reject", authMiddleware.Authenticate(http.HandlerFunc(jobHandler.RejectProposal)))
	mux.Handle("POST /api/v1/proposals/{id}/hire", authMiddleware.Authenticate(http.HandlerFunc(contractHandler.HireFreelancer)))

	// Contract routes (protected)
	mux.Handle("GET /api/v1/contracts", authMiddleware.Authenticate(http.HandlerFunc(contractHandler.ListContracts)))
	mux.Handle("GET /api/v1/contracts/{id}", authMiddleware.Authenticate(http.HandlerFunc(contractHandler.GetContract)))
	mux.Handle("POST /api/v1/contracts/{id}/milestones", authMiddleware.Authenticate(http.HandlerFunc(contractHandler.AddMilestone)))
	mux.Handle("POST /api/v1/contracts/{id}/complete", authMiddleware.Authenticate(http.HandlerFunc(contractHandler.CompleteContract)))

	// Milestone routes (protected)
	mux.Handle("POST /api/v1/milestones/{id}/submit", authMiddleware.Authenticate(http.HandlerFunc(contractHandler.SubmitMilestone)))
	mux.Handle("POST /api/v1/milestones/{id}/approve", authMiddleware.Authenticate(http.HandlerFunc(contractHandler.ApproveMilestone)))
	mux.Handle("POST /api/v1/milestones/{id}/revision", authMiddleware.Authenticate(http.HandlerFunc(contractHandler.RequestRevision)))

	// Review routes
	mux.Handle("POST /api/v1/reviews", authMiddleware.Authenticate(http.HandlerFunc(reviewHandler.CreateReview)))
	mux.HandleFunc("GET /api/v1/reviews/{id}", reviewHandler.GetReview)
	mux.HandleFunc("GET /api/v1/contracts/{id}/reviews", reviewHandler.GetContractReviews)
	mux.HandleFunc("GET /api/v1/users/{id}/reviews", reviewHandler.GetUserReviews)

	// Notification routes (protected)
	mux.Handle("GET /api/v1/notifications", authMiddleware.Authenticate(http.HandlerFunc(notificationHandler.GetNotifications)))
	mux.Handle("GET /api/v1/notifications/unread-count", authMiddleware.Authenticate(http.HandlerFunc(notificationHandler.GetUnreadCount)))
	mux.Handle("POST /api/v1/notifications/{id}/read", authMiddleware.Authenticate(http.HandlerFunc(notificationHandler.MarkAsRead)))
	mux.Handle("POST /api/v1/notifications/read-all", authMiddleware.Authenticate(http.HandlerFunc(notificationHandler.MarkAllAsRead)))

	// Message routes (protected)
	mux.Handle("GET /api/v1/conversations", authMiddleware.Authenticate(http.HandlerFunc(messageHandler.GetConversations)))
	mux.Handle("POST /api/v1/conversations", authMiddleware.Authenticate(http.HandlerFunc(messageHandler.CreateConversation)))
	mux.Handle("GET /api/v1/conversations/{id}", authMiddleware.Authenticate(http.HandlerFunc(messageHandler.GetConversation)))
	mux.Handle("GET /api/v1/conversations/{id}/messages", authMiddleware.Authenticate(http.HandlerFunc(messageHandler.GetMessages)))
	mux.Handle("POST /api/v1/conversations/{id}/messages", authMiddleware.Authenticate(http.HandlerFunc(messageHandler.SendMessage)))
	mux.Handle("POST /api/v1/conversations/{id}/read", authMiddleware.Authenticate(http.HandlerFunc(messageHandler.MarkConversationRead)))
	mux.Handle("GET /api/v1/messages/unread-count", authMiddleware.Authenticate(http.HandlerFunc(messageHandler.GetUnreadCount)))
	mux.Handle("GET /api/v1/contracts/{id}/conversation", authMiddleware.Authenticate(http.HandlerFunc(messageHandler.GetContractConversation)))

	// Upload routes
	mux.Handle("POST /api/v1/upload", authMiddleware.Authenticate(http.HandlerFunc(uploadHandler.UploadFile)))
	mux.HandleFunc("GET /uploads/", uploadHandler.ServeFile)

	// Apply global middleware
	var handler http.Handler = mux
	handler = middleware.CORS(corsConfig)(handler)
	handler = middleware.Logger(handler)
	handler = middleware.Recovery(handler)

	// Create server
	server := &http.Server{
		Addr:         ":" + cfg.Server.Port,
		Handler:      handler,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	// Start server in goroutine
	go func() {
		log.Printf("Server listening on http://localhost:%s", cfg.Server.Port)
		if err := server.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Server error: %v", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	// Graceful shutdown with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := server.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server stopped")
}

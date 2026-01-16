# TrenchJobs

A freelance marketplace powered by Solana blockchain with trustless escrow payments.

## Features

- **Trustless Escrow**: Funds secured on-chain in Solana escrow until work is approved
- **Instant Payments**: Get paid in SOL directly to your wallet
- **Low Fees**: Only 5% platform fee, near-zero Solana transaction costs
- **Wallet Authentication**: Sign in with Phantom or Solflare

## Tech Stack

- **Frontend**: HTML, CSS (custom), Vanilla JavaScript
- **Backend**: Golang with PostgreSQL
- **Blockchain**: Solana (Anchor framework)
- **Network**: Devnet (for development)

## Project Structure

```
trenchjob/
├── backend/                 # Golang API server
│   ├── cmd/server/         # Entry point
│   ├── internal/           # Application code
│   │   ├── config/         # Configuration
│   │   ├── domain/         # Domain models
│   │   ├── repository/     # Data access
│   │   ├── service/        # Business logic
│   │   ├── handler/        # HTTP handlers
│   │   ├── middleware/     # HTTP middleware
│   │   ├── solana/         # Solana integration
│   │   └── pkg/            # Shared utilities
│   └── migrations/         # Database migrations
│
├── frontend/               # Static frontend
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript modules
│   ├── pages/             # HTML pages
│   └── assets/            # Images, fonts, icons
│
├── solana-program/        # Anchor escrow program
│   └── programs/
│       └── trenchjob-escrow/
│
└── docker/                # Docker configuration
```

## Quick Start

### Prerequisites

- Go 1.22+
- PostgreSQL 16+
- Node.js 18+ (for Anchor)
- Rust & Anchor CLI (for Solana program)
- Phantom or Solflare wallet

### Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/trenchjob.git
   cd trenchjob
   ```

2. **Start PostgreSQL** (using Docker)
   ```bash
   docker-compose up -d postgres
   ```

3. **Run database migrations**
   ```bash
   psql -h localhost -U postgres -d trenchjob -f backend/migrations/001_initial_schema.up.sql
   ```

4. **Configure environment**
   ```bash
   cp backend/.env.example backend/.env
   # Edit .env with your settings
   ```

5. **Start the backend**
   ```bash
   cd backend
   go run cmd/server/main.go
   ```

6. **Start the frontend** (in another terminal)
   ```bash
   cd frontend
   python -m http.server 3000
   # Or use any static file server
   ```

7. **Open the app**
   - Frontend: http://localhost:3000
   - API: http://localhost:8080

### Using Docker Compose

```bash
docker-compose up -d
```

This starts:
- PostgreSQL on port 5432
- Backend API on port 8080
- Frontend on port 3000

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - Create account
- `POST /api/v1/auth/login` - Email/password login
- `POST /api/v1/auth/login/wallet` - Wallet signature login
- `GET /api/v1/wallet/nonce` - Get nonce for wallet auth
- `POST /api/v1/wallet/connect` - Link wallet to account

### Jobs
- `POST /api/v1/jobs` - Create job
- `GET /api/v1/jobs` - List/search jobs
- `GET /api/v1/jobs/:id` - Get job details
- `POST /api/v1/jobs/:id/proposals` - Submit proposal

### Contracts
- `GET /api/v1/contracts` - List contracts
- `GET /api/v1/contracts/:id` - Get contract details
- `POST /api/v1/milestones/:id/submit` - Submit work
- `POST /api/v1/milestones/:id/approve` - Approve milestone

### Escrow
- `POST /api/v1/escrow/build/fund` - Build fund transaction
- `POST /api/v1/escrow/build/release` - Build release transaction
- `POST /api/v1/payments/verify/:txSignature` - Verify on-chain

## Solana Escrow Program

The escrow program is built with Anchor and includes:

- `initialize_escrow` - Create new escrow for contract
- `fund_escrow` - Client deposits SOL
- `release_milestone` - Release payment to freelancer
- `refund` - Return funds to client
- `open_dispute` - Freeze escrow for dispute

### Build & Deploy

```bash
cd solana-program
anchor build
anchor deploy --provider.cluster devnet
```

## Payment Flow

1. **Client hires freelancer** → Contract created in DB
2. **Client funds escrow** → SOL locked on-chain
3. **Freelancer submits work** → Milestone marked submitted
4. **Client approves** → SOL released to freelancer
5. **Contract complete** → Both parties leave reviews

## License

MIT License - see LICENSE file for details.

# TrenchJobs Frontend Documentation

> **For Backend Developers** - This document covers everything you need to know about the frontend architecture, API contracts, and integration points.

---

## Quick Start

```bash
cd frontend-new
npm install
npm run dev  # Starts on http://localhost:5173
```

**Environment Variables** (`.env`):
```
VITE_API_URL=http://localhost:8080/api/v1
```

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| React 18 + TypeScript | UI Framework |
| Vite | Build tool |
| TailwindCSS | Styling |
| React Router v6 | Routing |
| Axios | HTTP client |
| Framer Motion | Animations |
| @solana/wallet-adapter | Wallet connection |

---

## API Base URL

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
```

All requests include JWT token in Authorization header:
```
Authorization: Bearer <token>
```

---

## API Contracts

### Authentication

#### `POST /auth/signup`
```json
// Request
{ "email": "user@example.com", "password": "...", "role": "client" | "freelancer" }

// Response
{ "token": "jwt...", "user": { "id": "uuid", "email": "...", "role": "..." } }
```

#### `POST /auth/login`
```json
// Request
{ "email": "user@example.com", "password": "..." }

// Response
{ "token": "jwt...", "user": { "id": "uuid", "email": "...", "role": "..." } }
```

#### `GET /auth/nonce?wallet_address=<address>`
```json
// Response
{ "nonce": "random-string", "message": "Sign this message to verify..." }
```

#### `POST /auth/login/wallet`
```json
// Request
{ "wallet_address": "...", "signature": "base58-encoded" }

// Response
{ "token": "jwt...", "user": { ... } }
```

---

### Jobs

#### `GET /jobs`
Query params: `q`, `category_id`, `skills[]`, `status`, `min_budget`, `max_budget`, `limit`, `offset`

```json
// Response
{
  "jobs": [
    {
      "id": "uuid",
      "title": "Senior Rust Developer",
      "description": "...",
      "budget": 150,
      "budget_type": "fixed" | "hourly",
      "difficulty": "intermediate",
      "status": "open",
      "skills": ["Rust", "Solana"],
      "client_id": "uuid",
      "created_at": "2024-01-15T...",
      "proposal_count": 5
    }
  ],
  "total": 100
}
```

#### `GET /jobs/:id`
Single job with full details.

#### `POST /jobs` (Auth Required)
```json
// Request
{
  "title": "...",
  "description": "...",
  "budget": 150,
  "budget_type": "fixed",
  "difficulty": "intermediate",
  "skills": ["Rust", "Solana"]
}
```

#### `GET /jobs/mine` (Auth Required)
Returns jobs created by the authenticated user.

#### `POST /jobs/:id/publish` (Auth Required)
Publishes a draft job.

#### `GET /jobs/:id/proposals` (Auth Required)
Returns proposals for a job (client only).

---

### Proposals

#### `POST /jobs/:id/proposals` (Auth Required)
```json
// Request
{
  "cover_letter": "...",
  "proposed_rate": 100,
  "estimated_duration": "2 weeks"
}
```

#### `GET /proposals/mine` (Auth Required)
Returns freelancer's proposals.

```json
// Response
{
  "proposals": [
    {
      "id": "uuid",
      "job_id": "uuid",
      "cover_letter": "...",
      "proposed_rate": 100,
      "status": "pending" | "shortlisted" | "rejected" | "hired",
      "created_at": "...",
      "job": { "title": "...", "client": { ... } }
    }
  ],
  "total": 10
}
```

#### `POST /proposals/:id/shortlist` (Auth Required, Client)
#### `POST /proposals/:id/reject` (Auth Required, Client)
#### `POST /proposals/:id/hire` (Auth Required, Client)
#### `DELETE /proposals/:id` (Auth Required, Freelancer - Withdraw)

---

### Profiles

#### `GET /profile` (Auth Required)
Returns authenticated user's profile.

```json
// Response
{
  "profile": {
    "id": "uuid",
    "display_name": "Alex",
    "professional_title": "Rust Developer",
    "bio": "...",
    "hourly_rate_sol": 25,
    "available_for_hire": true
  },
  "skills": [{ "id": "uuid", "name": "Rust" }],
  "portfolio": [{ "id": "uuid", "title": "...", "url": "..." }],
  "stats": {
    "total_earnings": 1250,
    "jobs_completed": 15,
    "rating": 4.9,
    "review_count": 12
  }
}
```

#### `GET /profiles`
Query params: `q`, `skills[]`, `min_rate`, `max_rate`, `available_only`, `limit`, `offset`

#### `GET /profiles/:id`
Public profile view.

#### `PUT /profile` (Auth Required)
Update profile fields.

---

### Contracts

#### `GET /contracts` (Auth Required)
Query params: `status`, `role=client|freelancer`, `limit`, `offset`

```json
// Response
{
  "contracts": [
    {
      "id": "uuid",
      "job_id": "uuid",
      "title": "Solana API Integration",
      "total_amount": 150,
      "status": "active" | "completed" | "cancelled",
      "escrow_address": "...",
      "milestones": [
        {
          "id": "uuid",
          "title": "Phase 1",
          "amount": 50,
          "status": "pending" | "in_progress" | "submitted" | "approved"
        }
      ]
    }
  ],
  "total": 5
}
```

#### `POST /contracts/:id/milestones` (Auth Required)
Add a milestone.

#### `POST /milestones/:id/submit` (Auth Required, Freelancer)
#### `POST /milestones/:id/approve` (Auth Required, Client)
#### `POST /milestones/:id/revision` (Auth Required, Client)

---

## Frontend Pages & Data Needs

| Page | Route | API Dependencies |
|------|-------|------------------|
| Home | `/` | None (static) |
| Jobs | `/jobs` | `GET /jobs` |
| Job Detail | `/jobs/:id` | `GET /jobs/:id` |
| Auth | `/auth/*` | `POST /auth/signup`, `POST /auth/login` |
| Freelancer Dashboard | `/freelancer/dashboard` | `GET /profile`, `GET /contracts`, `GET /proposals/mine` |
| My Proposals | `/freelancer/proposals` | `GET /proposals/mine` |
| Client Dashboard | `/client/dashboard` | `GET /profile`, `GET /contracts`, `GET /jobs/mine` |
| Manage Jobs | `/client/jobs` | `GET /jobs/mine`, `GET /jobs/:id/proposals` |
| Post Job | `/client/post-job` | `POST /jobs` |
| Escrow | `/escrow` | `GET /contracts` |
| Talent | `/talent` | `GET /profiles` |

---

## Wallet Integration

The frontend uses **Solana wallet-adapter**. When a user connects their wallet:

1. Frontend calls `GET /auth/nonce?wallet_address=<pubkey>`
2. User signs the nonce message with their wallet
3. Frontend sends `POST /auth/login/wallet` with address + signature
4. Backend verifies signature and returns JWT

**Supported Wallets**: Phantom, Solflare

---

## Frontend File Structure

```
src/
├── components/
│   ├── layout/           # Navbar, Footer, DashboardLayout
│   ├── ui/               # Button, Input, EmptyState, OnboardingChecklist
│   └── wallet/           # WalletIndicator
├── context/
│   └── WalletContextProvider.tsx
├── lib/
│   ├── api.ts            # All API methods ⭐
│   └── utils.ts
├── pages/
│   ├── Home.tsx
│   ├── Jobs.tsx
│   ├── JobDetail.tsx
│   ├── Escrow.tsx
│   ├── Messages.tsx
│   ├── client/           # PostJob, ManageJobs, Dashboard
│   └── freelancer/       # Dashboard, MyProposals, ActiveContracts
└── services/
    └── escrow.ts         # Solana escrow interactions
```

---

## Important Notes

1. **Mock Data Fallback**: All pages fall back to mock data if the backend is unavailable
2. **Auth Token**: Stored in `localStorage` under key `token`
3. **CORS**: Backend must allow `http://localhost:5173` and `http://localhost:5174`
4. **Error Responses**: Frontend expects `{ "error": "message" }` format

---

## Contact

Frontend is maintained by the frontend team. For questions about API integration, check `src/lib/api.ts` which has all the type definitions and API methods.

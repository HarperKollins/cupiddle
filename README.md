# Cupiddle — Curiosity is Attractive

> Curiosity-first dating and social discovery platform for curious minds, creators, and deep thinkers.

## Key Directives Implemented

1. **100% Free Platform:** All payment paywalls and subscription restrictions eliminated. Unlimited Sparks, full Idea Stream discovery, real-time messaging, communities, and Co-op Corner games are completely free for all users.
2. **Decoupled Architecture:** Clean separation of frontend and backend:
   - `server/`: High-performance, ultra-low latency Go backend service (REST + WebSockets).
   - `web/`: Modern React 19 + TypeScript web discovery portal and marketing site.
   - `admin/`: Dedicated Administration, Trust & Safety moderation console.
   - `mobile/`: React Native / Expo mobile application for iOS & Android.
3. **Ultra-Low Latency Go Engine:** Sub-millisecond routing (Chi), native concurrent goroutine WebSocket hub, geospatial Haversine proximity calculations, and dual PostgreSQL/SQLite SQL persistence.

---

## Architecture Overview

```
cuppidle/
├── server/                     # Ultra-Low Latency Go Server
│   ├── cmd/server/main.go      # HTTP & WebSocket Engine
│   ├── cmd/seed/main.go        # Database Seeding Utility
│   ├── internal/
│   │   ├── auth/               # Password hashing, JWT, 18+ verification
│   │   ├── config/             # Environment & runtime config
│   │   ├── database/           # Dual DB driver (PostgreSQL/SQLite) & migrations
│   │   ├── handlers/           # Profiles, Sparks, Discovery, Chat, Co-op, Admin
│   │   ├── middleware/         # Auth, RateLimiter, SecurityHeaders, CORS
│   │   ├── models/             # Domain structs
│   │   └── websocket/          # Real-time WebSocket connection hub
├── web/                        # Decoupled Web Discovery Client (React + TS + Vite)
├── admin/                      # Decoupled Admin & Moderation Console (React + TS + Vite)
├── mobile/                     # React Native / Expo Mobile App
└── docs/                       # Architecture, Deployment & Legal Policies
```

---

## Quick Start

### 1. Backend Server
```powershell
cd server
./seed.exe     # Seed initial communities and curious profiles
./server.exe   # Starts server on http://localhost:8080
```

### 2. Web Portal
```powershell
cd web
npm run dev    # Starts on http://localhost:3000
```

### 3. Admin & Moderation Console
```powershell
cd admin
npm run dev    # Starts on http://localhost:3001
# Log in with: admin@cupiddle.com / CupiddleAdmin2026!
```

### 4. Run Automated Tests
```powershell
cd server
go test -v ./...
```

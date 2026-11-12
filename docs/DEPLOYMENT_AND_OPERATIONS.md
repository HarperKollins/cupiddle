# Cupiddle — Production Deployment & Operations Guide

**Backend:** Go (Golang) — High-Performance, Ultra-Low Latency Engine  
**Decoupled Architecture:**
- Server: Go Chi HTTP + WebSocket Engine (`server/`)
- Web Portal: React 19 + TypeScript + Vite (`web/`)
- Admin Console: React 19 + TypeScript + Vite (`admin/`)
- Mobile App: React Native / Expo (`mobile/`)
- Commercial Model: 100% Free for all users

---

## 1. Quick Local Startup

### 1.1 Run the Ultra-Low Latency Go Server
```powershell
cd server
# Run migrations and seed development data
./seed.exe

# Start the high-performance server (Port 8080)
./server.exe
```
Or with `go run`:
```powershell
cd server
go run ./cmd/server
```

### 1.2 Start the Web Discovery App (Port 3000)
```powershell
cd web
npm run dev
# Opens at http://localhost:3000 with real-time API proxy to :8080
```

### 1.3 Start the Administration & Moderation Console (Port 3001)
```powershell
cd admin
npm run dev
# Opens at http://localhost:3001
# Log in with: admin@cupiddle.com / CupiddleAdmin2026!
```

### 1.4 Start the Mobile Application (Expo)
```powershell
cd mobile
npx expo start
```

---

## 2. Automated Test Verification

Run the comprehensive Go test suite covering password hashing, 18+ birthdate enforcement, JWT authentication, and protected endpoint access:
```powershell
cd server
go test -v ./...
```

---

## 3. Production Environment Configuration

Create a `.env` file in `server/` or pass system environment variables:

| Variable | Description | Default | Production Recommendation |
|---|---|---|---|
| `PORT` | HTTP & WebSocket listen port | `8080` | `8080` |
| `DATABASE_URL` | PostgreSQL or SQLite connection string | `cuppidle.db` | `postgres://user:pass@ep-db.region.supabase.co:5432/postgres?sslmode=require` |
| `DB_DRIVER` | Database engine (`postgres` or `sqlite`) | Auto-detected | `postgres` |
| `JWT_SECRET` | Secret key for signing JWT tokens | Default dev key | Cryptographically random 64-char string |
| `STORAGE_PATH` | Directory for uploaded media | `./uploads` | Persistent volume mount or object storage |
| `ENVIRONMENT` | Runtime mode | `development` | `production` |
| `RATE_LIMIT_REQ` | Max requests per IP per minute | `120` | `240` |

---

## 4. Production Build & Deployment

### 4.1 Compile the Go Binary for Linux (Production Server)
```bash
cd server
GOOS=linux GOARCH=amd64 go build -ldflags="-w -s" -o cupiddle-server ./cmd/server
```

### 4.2 Build Frontend Assets
```bash
# Build Web Portal
cd web
npm run build
# Distributable static files in web/dist/

# Build Admin Console
cd admin
npm run build
# Distributable static files in admin/dist/
```

### 4.3 Database Backup & Restore Procedure
- **SQLite (Local / Standalone):** Automated hourly atomic snapshot of `cuppidle.db`.
- **PostgreSQL (Supabase / Production):** Nightly automated backups with Point-in-Time Recovery (PITR) enabled.


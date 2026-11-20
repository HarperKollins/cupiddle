# Cupiddle — The Nigerian Campus Connection Platform 🎓⚡

> **Curiosity-first, secret, and zero-cost connection engine built exclusively for Nigerian university students.**  
> Beachhead Campus: **Ebonyi State University (EBSU)** · Expanding across Nigerian Universities (UNN, UNILAG, OAU, UI, ABU, FUTO, ESUT, IMSU).

---

## 🌟 The Vision: Why Cupiddle Was Re-imagined

Most university students in Nigeria experience profound loneliness, academic exhaustion, and a desire for genuine companionship, late-night conversations, study partners, or mutual attraction. Yet, virtually no student wants to publicly admit they feel lonely or put themselves on conventional dating apps due to:
1. **Fear of exposure** to friends, coursemates, lecturers, or family.
2. **Expensive paywalls** and paid KYC checks that students cannot afford.
3. **Pervasive phone number harassment** and immediate requests to leave the app for WhatsApp.
4. **Commercial exploitation** (escort solicitation, transport fare billing, romance scams).
5. **Fear of screenshots, leaks, and blackmail.**

**Cupiddle Campus Edition** solves this with an exclusive, secure, 100% free web and mobile app where students connect authentically while keeping their identity completely protected.

---

## 🚀 Core Features & Directives Built

### 1. 100% Free Forever (₦0 Budget)
- **Zero Paywalls**: Unlimited Sparks, full Discovery stream, instant chat, voice notes, and games are **100% free for all students**.
- **Zero Paid APIs**: Traditional identity verification APIs (Prembly, Dojah, Smile Identity) charge ₦150–₦500 per check, which is unsustainable for students. Cupiddle uses a bespoke **zero-cost public and peer verification architecture**.

### 2. Private Real Names & Custom `@username` Handles
- **Total Anonymity**: Real full names and phone numbers are never made public.
- **Unique Handle**: Students claim a custom `@username` (e.g. `@amaka_ebsu`, `@kachi_unn`, `@chidi_300L`) during signup.
- **Live Uniqueness Validation**: Real-time debounce feedback (`GET /api/auth/check-username?username=...`) ensures handles are instantly checked and claimed.
- **Flexible Sign-in**: Students can log in using either their registered email address or `@username`.

### 3. Strict In-App Permanence (No Phone Numbers Ever)
- **Automated Contact Filter**: Both server-side Go regex ([`chat_handler.go`](server/internal/handlers/chat_handler.go)) and client-side sanitizers scan all messages in real time.
- **Nigerian Number Defense**: Blocks standard Nigerian GSM prefixes (`080x`, `070x`, `081x`, `090x`, `+234x`), spaced formats (`0 8 0 3 ...`), and spelled-out phone numbers (`"zero eight zero..."`).
- **External Redirect Blocker**: Prevents links to WhatsApp, Telegram, Snapchat, and external socials, keeping students safely inside the encrypted app.

### 4. Anti-Screenshot & Screen Recording Privacy Shield
- **Multitasking & Task-Switcher Blurring**: [`useScreenshotProtection.ts`](web/src/hooks/useScreenshotProtection.ts) listens to `visibilitychange` and window `blur` events. If a student backgrounds the app or opens their OS app switcher (which captures preview screenshots), the screen immediately blanks with a frosted security curtain.
- **PrintScreen Detection**: Hardware keys (`PrintScreen`, `Win+Shift+S`, macOS shortcuts) trigger an immediate privacy shield and on-screen privacy reminder.
- **Copy & Text Protection**: Global CSS rule `.secure-student-app` enforces `user-select: none` and `-webkit-touch-callout: none` to prevent text copying and dragging.

### 5. User-Written Connection Gate Questions
- **No Random Unwanted Slides**: Instead of generic swipes based on photos alone, every student sets their own **Gate Question** (e.g. *"What's the best midnight study spot on campus?"* or *"Which 300L lecturer tests hardest?"*).
- **Mandatory Response**: To spark a connection, candidates must read and submit a written answer to that specific Gate Question.
- **Mutual Connection**: Once the recipient reviews the answer and accepts, the conversation unlocks.

### 6. Real-Time Campus Mood & Vibe Tags
- **Live Broadcast**: A horizontal mood selector right on top of the discovery feed lets students broadcast their current campus vibe with a single tap:
  - 🫠 **Feeling lonely rn** — Looking for friendly companionship
  - 📚 **Need a study buddy** — Preparing for tests, exam night reads
  - 🌙 **Late night, bored** — Midnight rants and banter
  - 🔥 **Ready to meet someone** — Mutual spark and chemistry
  - 💭 **Just want to talk** — Venting and listening without pressure
  - 🎮 **Vibes only, no pressure** — Chill campus hangout
  - ⚡ **Looking for my spark** — Romantic curiosity
  - 😶‍🌫️ **Secret mode — curious** — Discreet, quiet exploration
- **Vibe Filtering**: Candidates can easily discover coursemates and campus peers who are currently in the exact same frame of mind.

### 7. ₦0 Zero-Cost Student Verification Suite
Students can verify their campus status using four free, privacy-first methods:
1. **Tuition Receipt (Remita RRR Lookup)**: Verifies the 12-digit Remita Retrieval Reference (RRR) on the student's official university tuition receipt via public records without paid API charges.
2. **JAMB Matriculation Verification**: Checks matriculation registration numbers against public university admissions lists.
3. **Client-Side NIN Slip OCR + Live Face Match**: Runs in-browser via WebAssembly (`face-api.js` / MediaPipe). Verifies age (18+) and matches face against the NIN slip photo locally in ~45 seconds. The raw NIN is never stored; only a `SHA256(nin + salt)` hash is saved to prevent banned bad actors from ever re-registering.
4. **Peer Vouching ("Web of Trust")**: Two verified coursemates from the same faculty/department can endorse a student's profile to grant the **🎓 Verified Student** badge.

### 8. Consensual Attraction Allowed — Commercial Exploitation Blocked
- Adult mutual attraction, flirting, and dating intentions are warmly supported.
- Automated safety regex proactively blocks commercial prostitution, escort soliciting, transport fare ("tfare") extortion, and account number begging ("drop aza").

---

## 🏗️ Architecture & Tech Stack

```
cuppidle/
├── server/                     # Ultra-Low Latency Go 1.24+ Backend Service
│   ├── cmd/server/main.go      # REST Router, WebSocket Hub & Middleware Registration
│   ├── cmd/seed/main.go        # Database Seeding Utility for Test Campus Data
│   ├── internal/
│   │   ├── auth/               # Password Hashing, JWT Tokens, 18+ Birthdate Validation
│   │   ├── config/             # Environment, Secrets, and AWS S3/Port Bindings
│   │   ├── database/           # Dual-Driver Engine (PostgreSQL for Prod / Pure-Go SQLite for Unit Tests)
│   │   ├── handlers/           # Auth, Profiles, Verification, Discovery, Chat, Safety Regex
│   │   ├── middleware/         # JWT Guard, Rate Limiter, Security Headers, CORS
│   │   ├── models/             # Domain Structs (User, Profile, Spark, RadarSlot, PeerVouch)
│   │   └── websocket/          # Real-time WebSocket Messaging Hub
├── web/                        # Campus Client (React 19 + TypeScript + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthModal.tsx           # Google 1-Tap, @username checker, Campus dropdown
│   │   │   ├── IdeaStreamCard.tsx      # Campus profile cards, Gate Questions, Vibe tags
│   │   │   ├── MoodTagSelector.tsx     # 8 Campus Mood Tags
│   │   │   ├── ProfileEditor.tsx       # Campus verification card, Gate Question editor
│   │   │   ├── SparkModal.tsx          # Gate Question answer prompt
│   │   │   ├── VerificationModal.tsx   # Remita RRR, JAMB, NIN OCR & Peer Vouching modal
│   │   │   ├── ChatRoom.tsx            # Protected in-app chat with contact-leak defense
│   │   │   └── Navbar.tsx              # Navigation & live indicators
│   │   ├── hooks/
│   │   │   └── useScreenshotProtection.ts # Multitasking blur & PrintScreen protection
│   │   ├── styles/
│   │   │   └── design-tokens.css       # Bumble Sunlit Honey tokens & .secure-student-app
│   │   ├── api.ts                      # Typed HTTP & WebSocket client
│   │   └── types.ts                    # Student & campus type definitions
├── admin/                      # Administration, Safety & Moderation Portal (React 19)
├── mobile/                     # React Native / Expo Native Mobile Application
└── docs/                       # Architecture, Deployment & Security Documentation
```

---

## 📡 API Reference Overview

### Authentication & Identity
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/auth/check-username?username=...` | Live check if a `@username` handle is available |
| `POST` | `/api/auth/register` | Register new student with `@username`, campus, level, faculty |
| `POST` | `/api/auth/login` | Authenticate using email OR `@username` + password |
| `GET` | `/api/auth/me` | Fetch authenticated student user & profile records |

### Zero-Cost Campus Verification
| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/verify/remita` | Verify official student tuition via 12-digit RRR code |
| `POST` | `/api/verify/jamb` | Verify registration via JAMB matriculation portal check |
| `POST` | `/api/verify/nin-slip` | Submit client-side OCR NIN hash + face match result |
| `POST` | `/api/verify/vouch` | Endorse and vouch for a coursemate's student identity |

### Discovery, Gate Questions & Sparks
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/discovery/feed` | Stream campus candidate profiles with Gate Questions & Moods |
| `POST` | `/api/sparks` | Send a spark answering the candidate's Gate Question |
| `GET` | `/api/sparks/pending` | Fetch pending incoming sparks and gate question answers |
| `POST` | `/api/sparks/{id}/respond` | Accept or pass an incoming spark |

### In-App Messaging & Safety
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/chat/conversations` | List active peer conversations |
| `GET` | `/api/chat/{id}/messages` | Get encrypted in-app conversation messages |
| `POST` | `/api/chat/{id}/messages` | Send message (filtered by contact-leak safety regex) |
| `WS` | `/ws` | Real-time bi-directional message & chime streaming |

---

## 🛠️ Local Development & Testing

### 1. Run Backend Server
```powershell
cd server

# Seed campus test profiles & communities
go run ./cmd/seed

# Start the high-performance Go Chi server (Port 8080)
go run ./cmd/server
```

### 2. Run Automated Go Test Suite
```powershell
cd server
go test -v ./...
```
*Tests verify password hashing, 18+ birthdate enforcement, JWT generation, registration with unique handles, login with username/email, and protected routes using pure-Go SQLite test persistence.*

### 3. Run Web Discovery Client
```powershell
cd web
npm install
npm run dev
# Launches on http://localhost:3000 with real-time proxy to :8080
```

### 4. Build Production Web Bundle
```powershell
cd web
npm run build
# Compiles clean production assets into web/dist/
```

---

## 🔒 Security & Privacy Commitments

1. **No Data Selling**: Student data is never sold, shared with data brokers, or monetized via ads.
2. **Encrypted Persistence**: All passwords hashed with `bcrypt` (cost 12); NINs stored strictly as one-way salted `SHA256` hashes.
3. **No Phone Harassment**: Phone numbers are prevented by design from ever entering the platform.
4. **Anti-Leak Defense**: Screenshot deterrents and anti-copy styles protect student privacy against gossip and unwanted social distribution.

---

**Lead Developer & Maintainer**: Harper Kollins (`somtochukwucollins8@gmail.com`)  
**Repository**: [github.com/HarperKollins/cupiddle](https://github.com/HarperKollins/cupiddle.git) · **Branch**: `main`

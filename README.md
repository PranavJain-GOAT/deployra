# OmniPulse

> Your personal AI-powered dashboard — never miss an important email, message, contest, or deadline.

OmniPulse aggregates signals from Gmail, WhatsApp, Codeforces, LeetCode, CodeChef, and AtCoder into a single priority-ranked feed. It reads your messages, extracts deadlines and intent using a custom parser, and sends persistent browser notifications until you mark things done.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | React 18, TypeScript, Vite, TailwindCSS, Framer Motion |
| Backend | Node.js, Express, TypeScript |
| Real-time | Socket.IO, SSE |
| Email | Gmail IMAP (`imap` + `mailparser`) |
| WhatsApp | Baileys (WhatsApp Web protocol) |
| Contests | Codeforces API + Kontests aggregator |
| Notifications | Browser Push API with persistent reminders |

---

## Features

- 🔴 **Priority Feed** — unified timeline sorted by urgency, source, and deadline
- 📩 **Gmail scanner** — IMAP scan of unread emails, AI-filters important ones
- 💬 **WhatsApp** — QR scan like WhatsApp Web, parses group messages for assignments/placements/forms
- 🏆 **Live Contests** — Codeforces, LeetCode, CodeChef, AtCoder with countdown + direct Register link
- 📆 **Deadlines** — manual + auto-extracted with live countdowns
- 🔔 **Persistent reminders** — browser notifications every 5 min (critical) / 15 min (high) until ticked ✓
- ⌘K **Command Palette** — Raycast-style quick nav

---

## Getting Started

### Prerequisites
- Node.js 20 or 22 (not 24 — Baileys has a known issue on Node 24)
- PostgreSQL (optional — app works with mock data without it)

### 1. Clone
```bash
git clone https://github.com/PranavJain-GOAT/OmniPulse.git
cd OmniPulse
```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in your credentials
npm run dev            # → http://localhost:4000
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev            # → http://localhost:5173
```

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in:

| Variable | Description | Required |
|---|---|---|
| `GMAIL_USER` | Your Gmail address | For email scanning |
| `GMAIL_APP_PASSWORD` | [Gmail App Password](https://myaccount.google.com/apppasswords) — NOT your real password | For email scanning |
| `CODEFORCES_HANDLE` | Your CF handle | Optional (personalizes contest data) |
| `LEETCODE_USERNAME` | Your LeetCode username | Optional |
| `DATABASE_URL` | PostgreSQL connection string | Optional |

**No paid API keys needed.** Codeforces, LeetCode, CodeChef, AtCoder are all free public APIs.

---

## Connecting Accounts

| Account | How |
|---|---|
| **Gmail** | Create [App Password](https://myaccount.google.com/apppasswords) → paste in `.env` → restart backend |
| **WhatsApp** | Go to `/whatsapp` → click Connect → scan QR with phone (like WhatsApp Web) |
| **Codeforces** | Add handle to `.env` — already fetching live data |
| **LeetCode** | Add username to `.env` — already fetching contests |

---

## Deployment

### Frontend → Vercel
```
Root: frontend/
Build: npm run build
Output: dist/
```
Add env var: `VITE_API_URL=https://your-render-backend.onrender.com`

### Backend → Render
```
Root: backend/
Build: npm install && npx tsc
Start: node dist/server.js
```
Add all env vars from `.env.example`

---

## License
MIT

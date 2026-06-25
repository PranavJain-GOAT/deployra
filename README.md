# Deployra — Reusable SaaS Marketplace Platform

> **Configure. Deploy. Scale.**  
> A production-grade, secure, three-sided marketplace connecting clients, developers, and administrators to trade and manage self-hosted SaaS installations.

[![Frontend](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)](https://vercel.com)
[![Backend](https://img.shields.io/badge/Backend-Render-blue?logo=render)](https://render.com)
[![Database](https://img.shields.io/badge/Database-Neon_PostgreSQL-green?logo=postgresql)](https://neon.tech)
[![ORM](https://img.shields.io/badge/ORM-Prisma-2D3748?logo=prisma)](https://www.prisma.io)

---

## 📖 Overview

Deployra is a marketplace platform where developers can monetize reusable software architectures, automations, and AI agents. Instead of building custom systems from scratch for every client, developers package and publish listings. Clients then configure, purchase, and deploy them through the platform.

The platform coordinates the full product lifecycle:
* **Marketplace Discovery:** Search, filter, and preview approved product listings.
* **Role-Based Portals:** Distinct dashboards and API routing paths for **Clients**, **Developers**, and **Platform Admins**.
* **Double-Path Transactions:** Razorpay checkout validation combined with high-reliability background webhooks.
* **Admin Governance:** Admin-controlled product approval, rejection, suspension, and audit logging.

---

## ⚡ Key Technical Architectures

### 1. Advanced Authentication & Session Management
* **OAuth 2.0 Integration:** Secure social sign-ins via **Google OAuth 2.0** (Authorization Code Flow).
* **Dual-Token Rotation:** Stateless access tokens (15m expiry) paired with rotation-based refresh tokens (7d expiry).
* **Cryptographic Storage:** Refresh tokens are hashed using **SHA-256** before storage in PostgreSQL — raw tokens are never persisted.
* **HTTP-Only Cookies:** Tokens are delivered via `httpOnly`, `Secure`, `SameSite` cookies to block XSS and CSRF exposure.
* **Anti-Enumeration:** Forgot password endpoint returns the same response whether the email exists or not, preventing user enumeration attacks.

### 2. Dual-Layer Brute Force Defense
* **Layer 1 — IP-Based Rate Limiting:** `loginLimiter` restricts login attempts to **8 requests per 15 minutes** per IP via `express-rate-limit`. `skipSuccessfulRequests: true` prevents penalizing legitimate logins.
* **Layer 2 — Account-Level DB Lockout:** On the **5th consecutive failed login attempt**, the account is locked for **30 minutes** (`lockedUntil` DB field on the User model).
* **CPU Optimization:** Any login attempt during the lockout window is short-circuited immediately via an HTTP `423 Locked` response — the expensive `bcrypt.compare` operation is bypassed entirely.

### 3. High-Reliability Checkout & Webhook Pipeline
* **HMAC-SHA256 Signature Verification:** Validates Razorpay payment callbacks cryptographically to prevent fake or replayed payment injections.
* **Atomic Prisma Transactions:** Uses `prisma.$transaction` to guarantee `Purchase` and `Order` records are both created or both rolled back — no orphaned billing states.
* **Webhook Idempotency Guard:** Webhook receiver checks if a `Purchase` record with that `paymentIntentId` already exists before processing, preventing double-fulfillment when the browser closes mid-checkout.

### 4. Zero-Disk Media Stream Pipeline
* **Memory Buffer Uploads:** `multer.memoryStorage()` holds file bytes in system RAM — no temporary disk writes.
* **Stream to Cloudinary CDN:** RAM buffer is piped directly via `upload_stream()` to Cloudinary with auto `quality` and `fetch_format` transformations applied on upload.
* **Local Disk Fallback:** If Cloudinary environment variables are missing, the upload service automatically falls back to local `diskStorage` for development environments.

### 5. Product State Machine (Admin Governance)
* Products follow a strict `DRAFT → PENDING_REVIEW → APPROVED / REJECTED → SUSPENDED` lifecycle.
* Only `ADMIN` roles can transition from `PENDING_REVIEW`. Developers cannot self-approve listings.
* Every admin action (approve, reject, suspend) creates an immutable `AuditLog` record.

---

## 🛠️ Complete Tech Stack

### Frontend
| Package | Version | Purpose |
|---|---|---|
| `react` | ^18.2.0 | Core UI framework |
| `react-dom` | ^18.2.0 | DOM rendering |
| `react-router-dom` | ^6.26.0 | Client-side routing |
| `vite` | ^6.1.0 | Build bundler and dev server |
| `tailwindcss` | ^3.4.17 | Utility-first CSS styling |
| `framer-motion` | ^11.16.4 | Declarative animations |
| `@tanstack/react-query` | ^5.84.1 | Server state caching and sync |
| `axios` | ^1.17.0 | HTTP client with interceptors |
| `react-hot-toast` | ^2.6.0 | Toast notification system |
| `lucide-react` | ^0.475.0 | Icon library |
| `recharts` | ^2.15.4 | Dashboard charts and analytics |
| `canvas-confetti` | ^1.9.4 | Purchase success animation |
| `@radix-ui/react-slot` | ^1.1.2 | Accessible headless UI primitives |
| `clsx` + `tailwind-merge` | latest | Conditional class merging utility |

### Backend
| Package | Version | Purpose |
|---|---|---|
| `express` | ^5.2.1 | HTTP server and middleware pipeline |
| `@prisma/client` | ^5.22.0 | Type-safe PostgreSQL ORM client |
| `prisma` | ^5.22.0 | Schema migration and code generation |
| `bcrypt` | ^6.0.0 | Password hashing (cost factor 12) |
| `jsonwebtoken` | ^9.0.3 | JWT signing and verification |
| `joi` | ^18.1.2 | Declarative request body validation |
| `helmet` | ^8.1.0 | Security HTTP headers (CSP, HSTS, etc.) |
| `cors` | ^2.8.6 | CORS policy enforcement |
| `express-rate-limit` | ^8.3.2 | IP-based rate limiting middleware |
| `cloudinary` | ^2.10.0 | Image CDN upload streaming |
| `multer` | ^2.1.1 | Multipart form file buffer handling |
| `razorpay` | ^2.9.6 | Payment order creation and SDK |
| `nodemailer` | ^8.0.5 | Transactional SMTP email client |
| `winston` | ^3.19.0 | Structured runtime audit logger |
| `dotenv` | ^17.4.2 | Environment variable loader |
| `nodemon` | ^3.1.14 | Dev server auto-restart on file changes |

### Infrastructure
| Service | Purpose |
|---|---|
| **Neon PostgreSQL** | Serverless, autoscaling Postgres 16 database (SSL required) |
| **Cloudinary CDN** | Image storage, transformation, and delivery |
| **Razorpay** | Payment gateway (order creation + webhook callbacks) |
| **Google OAuth 2.0** | Social sign-in identity provider |
| **Nodemailer + Gmail SMTP** | Transactional email delivery |
| **Render.com** | Backend hosting (Node.js server with auto-deploy) |
| **Vercel** | Frontend CDN hosting (auto-deploy from Git) |

---

## 📂 Complete Directory Structure

```bash
Deployra/
├── backend/
│   ├── logs/
│   │   ├── combined.log            # All runtime logs (info, warn, error)
│   │   └── error.log               # Error-only log stream (persistent)
│   │
│   ├── prisma/
│   │   ├── migrations/             # Timestamped SQL migration history files
│   │   └── schema.prisma           # All 12 data models and DB configurations
│   │
│   ├── scripts/
│   │   └── seed.js                 # Seed script to populate mock product listings
│   │
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js         # Prisma singleton client + DB connect/disconnect
│   │   │
│   │   ├── controllers/
│   │   │   ├── admin.controller.js      # Admin product review and user management
│   │   │   ├── auth.controller.js       # Register, login, OAuth, token refresh
│   │   │   ├── notification.controller.js  # User notification CRUD
│   │   │   ├── order.controller.js      # Order record queries
│   │   │   ├── payment.controller.js    # Razorpay order creation and verification
│   │   │   ├── product.controller.js    # Product CRUD and public marketplace
│   │   │   ├── purchase.controller.js   # Purchase history queries
│   │   │   └── upload.controller.js     # Cloudinary / local disk image upload handler
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.middleware.js   # JWT authenticate() and authorize(role) guards
│   │   │   ├── errorHandler.js      # Global Express error handler (AppError class)
│   │   │   ├── rateLimiter.js       # authLimiter, loginLimiter, passwordResetLimiter
│   │   │   └── validate.js          # Joi schema validation middleware wrapper
│   │   │
│   │   ├── routes/
│   │   │   ├── index.js             # Central router mounting all sub-routers
│   │   │   ├── admin.routes.js      # /api/v1/admin/* (ADMIN role guarded)
│   │   │   ├── auth.routes.js       # /api/v1/auth/* + /auth/google OAuth routes
│   │   │   ├── notification.routes.js  # /api/v1/notifications/*
│   │   │   ├── order.routes.js      # /api/v1/orders/*
│   │   │   ├── payment.routes.js    # /api/v1/payments/*
│   │   │   ├── product.routes.js    # /api/v1/products/*
│   │   │   ├── purchase.routes.js   # /api/v1/purchases/*
│   │   │   ├── upload.routes.js     # /api/v1/uploads/*
│   │   │   └── user.routes.js       # /api/v1/users/*
│   │   │
│   │   ├── services/
│   │   │   ├── email.service.js     # Nodemailer SMTP transport + email templates
│   │   │   └── upload.service.js    # Multer config + Cloudinary/local storage switcher
│   │   │
│   │   ├── utils/
│   │   │   ├── jwt.js               # generateAccessToken / generateRefreshToken / verify
│   │   │   ├── logger.js            # Winston logger (file + console transports)
│   │   │   ├── schemas.js           # Joi validation schemas for all endpoints
│   │   │   └── totp.js              # TOTP 2FA generation and verification helpers
│   │   │
│   │   ├── app.js                   # Express app, global middlewares, route mounting
│   │   └── server.js               # HTTP server bootstrap (port bind, DB connect)
│   │
│   ├── .env.example
│   ├── package.json
│   └── package-lock.json
│
├── frontend/
│   ├── public/                      # Static assets served directly (favicon, og-image)
│   ├── src/
│   │   ├── api/                     # Axios API call definitions per domain
│   │   ├── components/              # Atomic reusable UI components (Button, Modal, Card)
│   │   ├── hooks/                   # Custom React hooks (TanStack Query, mutations)
│   │   ├── lib/
│   │   │   ├── AuthContext.jsx      # Global auth state + Axios default configuration
│   │   │   ├── ThemeContext.jsx     # Dark/light mode toggle context
│   │   │   ├── config.js            # VITE_API_URL environment variable resolver
│   │   │   ├── query-client.js      # TanStack QueryClient cache configuration
│   │   │   ├── PageNotFound.jsx     # 404 fallback page component
│   │   │   └── utils.js             # cn() class merge helper (clsx + tailwind-merge)
│   │   ├── pages/                   # Route-level view containers
│   │   ├── App.jsx                  # React Router route definitions
│   │   ├── main.jsx                 # React DOM root mount
│   │   └── index.css                # Tailwind base + custom CSS variables
│   │
│   ├── .env.example
│   ├── components.json              # shadcn/ui component registry config
│   ├── jsconfig.json                # JS path alias configuration (@/ → src/)
│   ├── tailwind.config.js
│   ├── vite.config.js
│   ├── vercel.json                  # Vercel SPA routing rewrite rules
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md
```

---

## 🔐 API Route Summary (33+ Endpoints)

| Domain | Method | Path | Auth Required |
|---|---|---|---|
| **Auth** | POST | `/api/v1/auth/register` | ❌ |
| | POST | `/api/v1/auth/login` | ❌ |
| | POST | `/api/v1/auth/logout` | ✅ |
| | POST | `/api/v1/auth/refresh` | ❌ |
| | POST | `/api/v1/auth/forgot-password` | ❌ |
| | POST | `/api/v1/auth/reset-password` | ❌ |
| | GET | `/api/v1/auth/verify-email` | ❌ |
| | POST | `/api/v1/auth/resend-verify` | ❌ |
| | GET | `/auth/google` | ❌ |
| | GET | `/auth/google/callback` | ❌ |
| **Products** | GET | `/api/v1/products/public` | ❌ |
| | GET | `/api/v1/products/:id` | ❌ |
| | POST | `/api/v1/products` | ✅ DEVELOPER |
| | PUT | `/api/v1/products/:id` | ✅ DEVELOPER |
| | DELETE | `/api/v1/products/:id` | ✅ DEVELOPER |
| **Payments** | POST | `/api/v1/payments/order` | ✅ |
| | POST | `/api/v1/payments/verify` | ✅ |
| | POST | `/api/v1/payments/webhook` | ❌ (signature verified) |
| **Users** | GET | `/api/v1/users/me` | ✅ |
| | PATCH | `/api/v1/users/me` | ✅ |
| **Purchases** | GET | `/api/v1/purchases` | ✅ |
| **Orders** | GET | `/api/v1/orders` | ✅ |
| **Notifications** | GET | `/api/v1/notifications` | ✅ |
| | PATCH | `/api/v1/notifications/:id/read` | ✅ |
| **Uploads** | POST | `/api/v1/uploads/image` | ✅ |
| **Admin** | GET | `/api/v1/admin/products/pending` | ✅ ADMIN |
| | PATCH | `/api/v1/admin/products/:id/approve` | ✅ ADMIN |
| | PATCH | `/api/v1/admin/products/:id/reject` | ✅ ADMIN |
| | GET | `/api/v1/admin/users` | ✅ ADMIN |

---

## 🚀 Installation & Local Setup

### 1. Clone the Repository
```bash
git clone https://github.com/PranavJain-GOAT/deployra.git
cd deployra
```

### 2. Backend Setup

#### Configure `backend/.env`
```env
PORT=5000
NODE_ENV=development

# Neon PostgreSQL
DATABASE_URL="postgresql://user:password@host/deployra?schema=public&sslmode=require"

# JWT
JWT_ACCESS_SECRET="generate_a_long_random_secret"
JWT_REFRESH_SECRET="generate_a_different_long_random_secret"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# Nodemailer (Gmail SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your_gmail@gmail.com"
SMTP_PASS="your_gmail_app_password"
EMAIL_FROM="Deployra <noreply@deployra.com>"

# Razorpay
RAZORPAY_KEY_ID="rzp_test_xxxxxxxxxxxx"
RAZORPAY_KEY_SECRET="your_razorpay_secret"
RAZORPAY_WEBHOOK_SECRET="your_webhook_secret"

# Google OAuth
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"
GOOGLE_REDIRECT_URI="http://localhost:5000/auth/google/callback"

# Cloudinary
CLOUDINARY_CLOUD_NAME="your_cloud_name"
CLOUDINARY_API_KEY="your_api_key"
CLOUDINARY_API_SECRET="your_api_secret"

# Frontend
FRONTEND_URL="http://localhost:3000"
```

#### Run Backend
```bash
cd backend
npm install
npx prisma migrate dev    # Apply all DB migrations to your PostgreSQL instance
npm run dev               # Starts Express server on http://localhost:5000
```

### 3. Frontend Setup

#### Configure `frontend/.env.local`
```env
VITE_API_URL="http://localhost:5000/api/v1"
VITE_RAZORPAY_KEY_ID="rzp_test_xxxxxxxxxxxx"
```

#### Run Frontend
```bash
cd frontend
npm install
npm run dev               # Starts Vite dev server on http://localhost:3000
```

---

## 📈 Roadmap

- [ ] Real-time deployment status tracking via WebSockets.
- [ ] Developer revenue analytics dashboard using Recharts.
- [ ] Automated Kubernetes pod deployment for purchased SaaS apps.
- [ ] Platform commission settlement and developer payout automation.
- [ ] Product subscription billing via recurring Razorpay subscription plans.

---

## 📄 License

This project is private and proprietary. All rights reserved.  
Built by **Pranav Jain**.

# Deployra — SaaS Marketplace Platform

> A production-grade, three-sided marketplace where developers publish SaaS products and clients purchase, configure, and deploy them. Built with a full security pipeline, payment processing, and role-based access control.

**Live Demo** · **[GitHub](https://github.com/PranavJain-GOAT/deployra)**

---

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, TanStack Query, Framer Motion, Axios

**Backend:** Node.js, Express 5, Prisma ORM, Neon PostgreSQL

**Integrations:** Razorpay, Cloudinary, Google OAuth 2.0, Nodemailer (SMTP)

**Hosting:** Vercel (frontend) · Render (backend)

---

## Key Features

### Authentication & Security
- **Google OAuth 2.0** social login alongside email/password authentication
- **Dual-token JWT system** — short-lived access tokens (15m) with rotating refresh tokens (7d), stored as HTTP-only cookies
- **Refresh tokens hashed with SHA-256** before database storage — raw tokens are never persisted
- **Brute force protection** — IP-based rate limiting via `express-rate-limit` combined with database-level account lockouts (30 min lock after 5 failed attempts)
- **Helmet.js** for secure HTTP headers (CSP, HSTS, X-Frame-Options)

### Payments
- **Razorpay checkout** with HMAC-SHA256 signature verification on the server
- **Atomic Prisma transactions** — Purchase and Order records are created together or rolled back entirely, preventing inconsistent payment states
- **Webhook idempotency guard** — duplicate Razorpay webhook events are detected and skipped safely

### Media Uploads
- **Zero-disk upload pipeline** — files are buffered in RAM using `multer.memoryStorage()` and streamed directly to Cloudinary CDN, no temporary files written to disk

### Admin & Product Governance
- Products go through a strict `DRAFT → PENDING_REVIEW → APPROVED / REJECTED` lifecycle
- Only Admins can approve or reject listings. Every admin action is recorded in an immutable `AuditLog`
- Three fully separate role-based dashboards for **Clients**, **Developers**, and **Admins**

---

## Project Structure

```
deployra/
├── backend/
│   ├── prisma/          # 12 data models, migration history
│   ├── src/
│   │   ├── config/      # Database client singleton
│   │   ├── controllers/ # auth, product, payment, admin, upload
│   │   ├── middleware/  # JWT guards, rate limiters, Joi validation, error handler
│   │   ├── routes/      # 33+ REST API endpoints
│   │   ├── services/    # Cloudinary upload stream, Nodemailer SMTP
│   │   └── utils/       # JWT helpers, Winston logger, Joi schemas
│   └── logs/            # Persistent error and combined log files
│
└── frontend/
    └── src/
        ├── api/         # Axios API definitions
        ├── components/  # Reusable UI components
        ├── hooks/       # TanStack Query data hooks
        ├── lib/         # Auth context, Axios config, query client
        └── pages/       # Client, Developer, and Admin dashboards
```

---

## Local Setup

```bash
# Clone
git clone https://github.com/PranavJain-GOAT/deployra.git

# Backend
cd backend && npm install
npx prisma migrate dev
npm run dev               # http://localhost:5000

# Frontend
cd ../frontend && npm install
npm run dev               # http://localhost:3000
```

**Required environment variables:** `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `SMTP_USER`, `SMTP_PASS`, `FRONTEND_URL`

---

Built by **Pranav Jain**

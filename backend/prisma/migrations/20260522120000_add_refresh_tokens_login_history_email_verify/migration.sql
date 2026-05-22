-- Migration: add_refresh_tokens_login_history_email_verify
-- Adds DB-backed refresh token storage (for session revocation),
-- login audit history, and email verification + brute-force protection fields.

-- ─── New columns on User ──────────────────────────────────────────────────────
ALTER TABLE "User"
  ADD COLUMN IF NOT EXISTS "emailVerifyToken"   TEXT,
  ADD COLUMN IF NOT EXISTS "emailVerifyExpires" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "lockedUntil"        TIMESTAMP(3);

-- ─── RefreshToken table ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "RefreshToken" (
  "id"          TEXT NOT NULL,
  "userId"      TEXT NOT NULL,
  "tokenHash"   TEXT NOT NULL,
  "userAgent"   TEXT,
  "ipAddress"   TEXT,
  "expiresAt"   TIMESTAMP(3) NOT NULL,
  "revoked"     BOOLEAN NOT NULL DEFAULT false,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- Unique constraint on token hash so lookup is O(1)
CREATE UNIQUE INDEX IF NOT EXISTS "RefreshToken_tokenHash_key" ON "RefreshToken"("tokenHash");

-- Index for efficient per-user lookups
CREATE INDEX IF NOT EXISTS "RefreshToken_userId_idx" ON "RefreshToken"("userId");

-- Foreign key back to User
ALTER TABLE "RefreshToken"
  ADD CONSTRAINT "RefreshToken_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── LoginHistory table ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "LoginHistory" (
  "id"          TEXT NOT NULL,
  "userId"      TEXT NOT NULL,
  "ipAddress"   TEXT,
  "userAgent"   TEXT,
  "success"     BOOLEAN NOT NULL,
  "failReason"  TEXT,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "LoginHistory_pkey" PRIMARY KEY ("id")
);

-- Index for efficient per-user lookups
CREATE INDEX IF NOT EXISTS "LoginHistory_userId_idx" ON "LoginHistory"("userId");

-- Foreign key back to User
ALTER TABLE "LoginHistory"
  ADD CONSTRAINT "LoginHistory_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

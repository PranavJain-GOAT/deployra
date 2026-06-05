-- ─── Migration: add_product_full_schema ──────────────────────────────────────
-- Adds new ProductStatus values, expands Product model, adds ProductView and AuditLog

-- Step 1: Drop old ProductStatus enum and recreate with full lifecycle values
-- (PostgreSQL requires special handling for enums)

-- Create new enum type with all values
DO $$ BEGIN
  CREATE TYPE "ProductStatus_new" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add all new columns to Product table first (nullable initially)
ALTER TABLE "Product" 
  ADD COLUMN IF NOT EXISTS "shortDesc" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "industries" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "requirements" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "deliveryDays" INTEGER NOT NULL DEFAULT 7,
  ADD COLUMN IF NOT EXISTS "revisions" TEXT NOT NULL DEFAULT '2',
  ADD COLUMN IF NOT EXISTS "support" TEXT NOT NULL DEFAULT '30 Days',
  ADD COLUMN IF NOT EXISTS "deploymentMethod" TEXT NOT NULL DEFAULT 'Developer Hosted',
  ADD COLUMN IF NOT EXISTS "hostingRequirements" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "coverImage" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "screenshots" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS "videoUrl" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "demoUrl" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "docsUrl" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "walkthroughUrl" TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS "configSchema" TEXT,
  ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT,
  ADD COLUMN IF NOT EXISTS "reviewedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "reviewedBy" TEXT;

-- Rename old features column if it conflicts (it stays as is)
-- Rename old images column to screenshots_old (we have new screenshots column)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='Product' AND column_name='images') THEN
    ALTER TABLE "Product" RENAME COLUMN "images" TO "images_old";
  END IF;
END $$;

-- Handle the status column enum migration
-- First add new status column as text
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "status_new" TEXT NOT NULL DEFAULT 'PENDING_REVIEW';

-- Migrate existing data: PENDING -> PENDING_REVIEW
UPDATE "Product" SET "status_new" = CASE 
  WHEN "status"::TEXT = 'PENDING' THEN 'PENDING_REVIEW'
  WHEN "status"::TEXT = 'APPROVED' THEN 'APPROVED'
  WHEN "status"::TEXT = 'REJECTED' THEN 'REJECTED'
  ELSE 'PENDING_REVIEW'
END;

-- Drop the old status column and its enum
ALTER TABLE "Product" DROP COLUMN "status";
DROP TYPE IF EXISTS "ProductStatus";

-- Create the new enum
CREATE TYPE "ProductStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- Add the new status column with proper enum type
ALTER TABLE "Product" ADD COLUMN "status" "ProductStatus" NOT NULL DEFAULT 'PENDING_REVIEW';

-- Copy data from text column
UPDATE "Product" SET "status" = "status_new"::"ProductStatus";

-- Drop temp column
ALTER TABLE "Product" DROP COLUMN "status_new";

-- Drop old new type if it exists
DROP TYPE IF EXISTS "ProductStatus_new";

-- ─── ProductView table ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "ProductView" (
  "id"        TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "visitorId" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ProductView_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ProductView_productId_idx" ON "ProductView"("productId");

ALTER TABLE "ProductView" 
  DROP CONSTRAINT IF EXISTS "ProductView_productId_fkey";
ALTER TABLE "ProductView" 
  ADD CONSTRAINT "ProductView_productId_fkey" 
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE;

-- ─── AuditLog table ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "AuditLog" (
  "id"         TEXT NOT NULL,
  "action"     TEXT NOT NULL,
  "actorId"    TEXT NOT NULL,
  "targetId"   TEXT NOT NULL,
  "targetType" TEXT NOT NULL,
  "metadata"   TEXT,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

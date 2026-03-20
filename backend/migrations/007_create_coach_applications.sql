-- Migration: 007_create_coach_applications.sql
-- Create coach_applications table for Athlete → Coach upgrade flow

-- 1. Enum type for application status
DO $$ BEGIN
    CREATE TYPE "coach_application_status_enum" AS ENUM('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 2. Main table
CREATE TABLE IF NOT EXISTS "coach_applications" (
    "id"                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id"             UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "status"              "coach_application_status_enum" NOT NULL DEFAULT 'pending',
    "specialties"         JSONB,
    "headline"            VARCHAR(255) NOT NULL,
    "base_price_monthly"  DECIMAL(10,2),
    "motivation"          TEXT NOT NULL,
    "certifications_note" TEXT,
    "reviewed_by"         UUID REFERENCES "users"("id") ON DELETE SET NULL,
    "reviewed_at"         TIMESTAMPTZ,
    "rejection_reason"    TEXT,
    "created_at"          TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at"          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Partial unique index: at most 1 pending application per user at a time
CREATE UNIQUE INDEX IF NOT EXISTS "UQ_coach_applications_user_pending"
ON "coach_applications" ("user_id")
WHERE "status" = 'pending';

-- 4. Index for admin listing (newest pending first)
CREATE INDEX IF NOT EXISTS "IDX_coach_applications_status"
ON "coach_applications" ("status", "created_at" DESC);

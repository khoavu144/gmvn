-- Migration: 007_create_coach_applications.sql
-- Athlete → Coach upgrade: store applications pending admin review

CREATE TABLE IF NOT EXISTS "coach_applications" (
    "id"                  uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id"             uuid NOT NULL,
    "status"              character varying(20) NOT NULL DEFAULT 'pending',
    "specialties"         jsonb,
    "headline"            character varying(255) NOT NULL,
    "base_price_monthly"  numeric(10,2),
    "motivation"          text NOT NULL,
    "certifications_note" text,
    "reviewed_by"         uuid,
    "reviewed_at"         TIMESTAMPTZ,
    "rejection_reason"    text,
    "created_at"          TIMESTAMP NOT NULL DEFAULT now(),
    "updated_at"          TIMESTAMP NOT NULL DEFAULT now(),

    CONSTRAINT "PK_coach_applications" PRIMARY KEY ("id"),
    CONSTRAINT "FK_coach_applications_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "FK_coach_applications_reviewer" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL,
    CONSTRAINT "CHK_coach_applications_status" CHECK ("status" IN ('pending', 'approved', 'rejected'))
);

-- At most 1 pending application per user at a time
CREATE UNIQUE INDEX IF NOT EXISTS "UQ_coach_applications_user_pending"
ON "coach_applications" ("user_id")
WHERE "status" = 'pending';

-- Admin listing index (oldest pending first = FIFO queue)
CREATE INDEX IF NOT EXISTS "IDX_coach_applications_status_created"
ON "coach_applications" ("status", "created_at" ASC);

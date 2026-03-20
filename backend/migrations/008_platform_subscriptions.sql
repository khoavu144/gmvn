-- Migration: 008_platform_subscriptions.sql
-- Platform-level subscription tiers (separate from coach-athlete subscriptions)

-- 1. Platform subscription plans per user
CREATE TABLE IF NOT EXISTS "platform_subscriptions" (
    "id"                    uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id"               uuid NOT NULL,
    "plan"                  varchar(30) NOT NULL DEFAULT 'free',
    "status"                varchar(20) NOT NULL DEFAULT 'active',
    "price_paid"            numeric(10,2),
    "started_at"            timestamptz NOT NULL DEFAULT now(),
    "expires_at"            timestamptz NOT NULL,
    "sepay_transaction_id"  varchar(255),
    "created_at"            timestamptz NOT NULL DEFAULT now(),
    "updated_at"            timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT "PK_platform_subscriptions" PRIMARY KEY ("id"),
    CONSTRAINT "FK_platform_sub_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "CHK_platform_plan" CHECK ("plan" IN ('free','coach_pro','coach_elite','athlete_premium','gym_business')),
    CONSTRAINT "CHK_platform_status" CHECK ("status" IN ('active','expired','cancelled'))
);

-- Only 1 active subscription per user at a time
CREATE UNIQUE INDEX IF NOT EXISTS "UQ_platform_sub_active_user"
ON "platform_subscriptions" ("user_id")
WHERE "status" = 'active';

-- For cron job: quickly find subs to expire
CREATE INDEX IF NOT EXISTS "IDX_platform_sub_expires"
ON "platform_subscriptions" ("expires_at", "status");

-- 2. App-wide key-value settings (for admin toggles)
CREATE TABLE IF NOT EXISTS "app_settings" (
    "key"         varchar(100) NOT NULL,
    "value"       text NOT NULL,
    "updated_at"  timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT "PK_app_settings" PRIMARY KEY ("key")
);

-- Billing starts OFF by default (early user-acquisition phase)
INSERT INTO "app_settings" ("key", "value")
VALUES ('billing_enabled', 'false')
ON CONFLICT ("key") DO NOTHING;

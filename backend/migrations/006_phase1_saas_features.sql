-- Phase 1 SaaS Features: Email Verification, Password Reset, Onboarding, Subscription Linking

-- 1. Email Verification Tokens table
CREATE TABLE IF NOT EXISTS "email_verification_tokens" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL,
    "token" character varying(6) NOT NULL,
    "expires_at" TIMESTAMP NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_email_verification" PRIMARY KEY ("id")
);

-- 2. Password Reset Tokens table
CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
    "id" uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id" uuid NOT NULL,
    "token" character varying(6) NOT NULL,
    "expires_at" TIMESTAMP NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_password_reset" PRIMARY KEY ("id")
);

-- 3. Add is_email_verified column to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_email_verified" boolean NOT NULL DEFAULT false;

-- 4. Add onboarding_completed column to users
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "onboarding_completed" boolean NOT NULL DEFAULT false;

-- 5. Add subscription_id to financial_transactions
ALTER TABLE "financial_transactions" ADD COLUMN IF NOT EXISTS "subscription_id" uuid;

-- 6. Unique active subscription constraint
CREATE UNIQUE INDEX IF NOT EXISTS "unique_active_subscription" ON "subscriptions" ("user_id", "program_id") WHERE status = 'active';

-- Migration: 016_paid_saas_production_readiness.sql
-- Production readiness: DB-backed auth sessions, checkout intents, email outbox

CREATE TABLE IF NOT EXISTS "auth_refresh_sessions" (
    "id"                 uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id"            uuid NOT NULL,
    "session_id"         uuid NOT NULL,
    "refresh_token_hash" varchar(128) NOT NULL,
    "status"             varchar(20) NOT NULL DEFAULT 'active',
    "issued_at"          timestamptz NOT NULL DEFAULT now(),
    "expires_at"         timestamptz NOT NULL,
    "last_rotated_at"    timestamptz,
    "revoked_at"         timestamptz,
    "created_at"         timestamptz NOT NULL DEFAULT now(),
    "updated_at"         timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT "PK_auth_refresh_sessions" PRIMARY KEY ("id"),
    CONSTRAINT "FK_auth_refresh_sessions_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "UQ_auth_refresh_sessions_session_id" UNIQUE ("session_id"),
    CONSTRAINT "CHK_auth_refresh_sessions_status" CHECK ("status" IN ('active', 'revoked', 'expired'))
);

CREATE INDEX IF NOT EXISTS "IDX_auth_refresh_sessions_user_status"
ON "auth_refresh_sessions" ("user_id", "status");

CREATE INDEX IF NOT EXISTS "IDX_auth_refresh_sessions_expires"
ON "auth_refresh_sessions" ("expires_at", "status");

CREATE TABLE IF NOT EXISTS "platform_checkout_intents" (
    "id"                      uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id"                 uuid NOT NULL,
    "plan"                    varchar(30) NOT NULL,
    "transfer_content"        varchar(255) NOT NULL,
    "amount"                  numeric(10,2) NOT NULL,
    "status"                  varchar(20) NOT NULL DEFAULT 'pending',
    "provider_transaction_id" varchar(255),
    "expires_at"              timestamptz NOT NULL,
    "paid_at"                 timestamptz,
    "metadata"                jsonb NOT NULL DEFAULT '{}'::jsonb,
    "created_at"              timestamptz NOT NULL DEFAULT now(),
    "updated_at"              timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT "PK_platform_checkout_intents" PRIMARY KEY ("id"),
    CONSTRAINT "FK_platform_checkout_intents_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "UQ_platform_checkout_intents_transfer_content" UNIQUE ("transfer_content"),
    CONSTRAINT "CHK_platform_checkout_intents_plan" CHECK ("plan" IN ('coach_pro','coach_elite','athlete_premium','gym_business')),
    CONSTRAINT "CHK_platform_checkout_intents_status" CHECK ("status" IN ('pending','paid','expired','cancelled','failed'))
);

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_platform_checkout_intents_provider_transaction"
ON "platform_checkout_intents" ("provider_transaction_id")
WHERE "provider_transaction_id" IS NOT NULL;

CREATE INDEX IF NOT EXISTS "IDX_platform_checkout_intents_user_status"
ON "platform_checkout_intents" ("user_id", "status");

CREATE INDEX IF NOT EXISTS "IDX_platform_checkout_intents_expires"
ON "platform_checkout_intents" ("expires_at", "status");

CREATE TABLE IF NOT EXISTS "email_outbox" (
    "id"              uuid NOT NULL DEFAULT gen_random_uuid(),
    "user_id"         uuid,
    "email_type"      varchar(50) NOT NULL,
    "recipient_email" varchar(255) NOT NULL,
    "subject"         varchar(255) NOT NULL,
    "payload"         jsonb NOT NULL DEFAULT '{}'::jsonb,
    "status"          varchar(20) NOT NULL DEFAULT 'pending',
    "attempt_count"   integer NOT NULL DEFAULT 0,
    "last_error"      text,
    "next_attempt_at" timestamptz NOT NULL DEFAULT now(),
    "sent_at"         timestamptz,
    "created_at"      timestamptz NOT NULL DEFAULT now(),
    "updated_at"      timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT "PK_email_outbox" PRIMARY KEY ("id"),
    CONSTRAINT "FK_email_outbox_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL,
    CONSTRAINT "CHK_email_outbox_type" CHECK ("email_type" IN ('verify_email','reset_password')),
    CONSTRAINT "CHK_email_outbox_status" CHECK ("status" IN ('pending','processing','sent','failed'))
);

CREATE INDEX IF NOT EXISTS "IDX_email_outbox_status_next_attempt"
ON "email_outbox" ("status", "next_attempt_at");

CREATE INDEX IF NOT EXISTS "IDX_email_outbox_user"
ON "email_outbox" ("user_id");

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_platform_subscriptions_transaction_id"
ON "platform_subscriptions" ("sepay_transaction_id")
WHERE "sepay_transaction_id" IS NOT NULL;

INSERT INTO "app_settings" ("key", "value")
VALUES ('billing_enabled', 'true')
ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value", "updated_at" = now();

-- Migration: 017_platform_support_observability.sql
-- Admin/support observability for platform billing webhooks

CREATE TABLE IF NOT EXISTS "platform_webhook_events" (
    "id"                      uuid NOT NULL DEFAULT gen_random_uuid(),
    "provider"                varchar(50) NOT NULL DEFAULT 'sepay',
    "provider_transaction_id" varchar(255),
    "transfer_content"        varchar(255),
    "signature"               varchar(255),
    "status"                  varchar(20) NOT NULL DEFAULT 'received',
    "payload"                 jsonb NOT NULL DEFAULT '{}'::jsonb,
    "metadata"                jsonb NOT NULL DEFAULT '{}'::jsonb,
    "error_message"           text,
    "received_at"             timestamptz NOT NULL DEFAULT now(),
    "processed_at"            timestamptz,
    "created_at"              timestamptz NOT NULL DEFAULT now(),
    "updated_at"              timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT "PK_platform_webhook_events" PRIMARY KEY ("id"),
    CONSTRAINT "CHK_platform_webhook_events_status" CHECK ("status" IN ('received','processed','ignored','failed'))
);

CREATE INDEX IF NOT EXISTS "IDX_platform_webhook_events_status_received"
ON "platform_webhook_events" ("status", "received_at");

CREATE INDEX IF NOT EXISTS "IDX_platform_webhook_events_transaction"
ON "platform_webhook_events" ("provider_transaction_id");

CREATE INDEX IF NOT EXISTS "IDX_platform_webhook_events_transfer_content"
ON "platform_webhook_events" ("transfer_content");

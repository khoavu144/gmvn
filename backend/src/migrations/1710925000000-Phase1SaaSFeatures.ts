import { MigrationInterface, QueryRunner } from "typeorm";

export class Phase1SaaSFeatures1710925000000 implements MigrationInterface {
    name = 'Phase1SaaSFeatures1710925000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // 1. Email Verification Tokens
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "email_verification_tokens" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "user_id" uuid NOT NULL,
                "token" character varying(6) NOT NULL,
                "expires_at" TIMESTAMP NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_email_verification" PRIMARY KEY ("id")
            )
        `);

        // 2. Password Reset Tokens
        await queryRunner.query(`
            CREATE TABLE IF NOT EXISTS "password_reset_tokens" (
                "id" uuid NOT NULL DEFAULT gen_random_uuid(),
                "user_id" uuid NOT NULL,
                "token" character varying(6) NOT NULL,
                "expires_at" TIMESTAMP NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_password_reset" PRIMARY KEY ("id")
            )
        `);

        // 3. User Columns
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_email_verified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "onboarding_completed" boolean NOT NULL DEFAULT false`);

        // 4. Financial Transaction column (linking webhooks to subscriptions)
        await queryRunner.query(`ALTER TABLE "financial_transactions" ADD COLUMN IF NOT EXISTS "subscription_id" uuid`);

        // 5. Subscription Unique Constraints
        await queryRunner.query(`CREATE UNIQUE INDEX IF NOT EXISTS "unique_active_subscription" ON "subscriptions" ("user_id", "program_id") WHERE status = 'active'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "unique_active_subscription"`);
        await queryRunner.query(`ALTER TABLE "financial_transactions" DROP COLUMN IF EXISTS "subscription_id"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "onboarding_completed"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "is_email_verified"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "password_reset_tokens"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "email_verification_tokens"`);
    }
}

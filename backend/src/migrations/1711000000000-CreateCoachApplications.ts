import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCoachApplications1711000000000 implements MigrationInterface {
    name = 'CreateCoachApplications1711000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create enum type for application status
        await queryRunner.query(`
            CREATE TYPE "coach_application_status_enum" AS ENUM('pending', 'approved', 'rejected')
        `);

        await queryRunner.query(`
            CREATE TABLE "coach_applications" (
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
            )
        `);

        // Partial unique index: at most one pending application per user at a time
        await queryRunner.query(`
            CREATE UNIQUE INDEX "UQ_coach_applications_user_pending"
            ON "coach_applications" ("user_id")
            WHERE "status" = 'pending'
        `);

        // Index for admin listing by status
        await queryRunner.query(`
            CREATE INDEX "IDX_coach_applications_status"
            ON "coach_applications" ("status", "created_at" DESC)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS "coach_applications"`);
        await queryRunner.query(`DROP TYPE IF EXISTS "coach_application_status_enum"`);
    }
}

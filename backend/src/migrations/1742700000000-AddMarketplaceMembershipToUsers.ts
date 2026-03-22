import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMarketplaceMembershipToUsers1742700000000 implements MigrationInterface {
    name = 'AddMarketplaceMembershipToUsers1742700000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users"
            ADD COLUMN IF NOT EXISTS "marketplace_membership_active" boolean NOT NULL DEFAULT false
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE "users" DROP COLUMN IF EXISTS "marketplace_membership_active"
        `);
    }
}

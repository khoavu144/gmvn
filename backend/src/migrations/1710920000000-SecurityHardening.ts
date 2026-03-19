import { MigrationInterface, QueryRunner } from "typeorm";

export class SecurityHardening1710920000000 implements MigrationInterface {
    name = 'SecurityHardening1710920000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // P0-1: Add is_active to users
        await queryRunner.query(`ALTER TABLE "users" ADD "is_active" boolean NOT NULL DEFAULT true`);
        
        // P0-7: Update default user_type from athlete to user
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "user_type" SET DEFAULT 'user'`);

        // P0-6: Increase trainer_profiles.slug length from 20 to 100
        await queryRunner.query(`ALTER TABLE "trainer_profiles" ALTER COLUMN "slug" TYPE character varying(100)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "trainer_profiles" ALTER COLUMN "slug" TYPE character varying(20)`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "user_type" SET DEFAULT 'athlete'`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "is_active"`);
    }
}

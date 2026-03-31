import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMessageContext1743000000000 implements MigrationInterface {
    name = 'AddMessageContext1743000000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "context_type" character varying(30)`);
        await queryRunner.query(`ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "context_id" uuid`);
        await queryRunner.query(`ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "context_label" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN IF EXISTS "context_label"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN IF EXISTS "context_id"`);
        await queryRunner.query(`ALTER TABLE "messages" DROP COLUMN IF EXISTS "context_type"`);
    }
}
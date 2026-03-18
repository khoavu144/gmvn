import dotenv from 'dotenv';
import { getEnv } from '../config/env';
import { runPendingMigrations } from '../services/sqlMigrationService';

dotenv.config();

const main = async () => {
    try {
        getEnv();
        const applied = await runPendingMigrations();

        if (applied.length === 0) {
            console.log('✅ No pending SQL migrations');
            return;
        }

        console.log(`✅ Applied ${applied.length} SQL migration(s):`);
        applied.forEach((migration) => {
            console.log(`   - ${migration.name}`);
        });
    } catch (error: any) {
        console.error('❌ Migration run failed:', error.message);
        process.exit(1);
    }
};

void main();

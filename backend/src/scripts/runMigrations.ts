import path from 'path';
import dotenv from 'dotenv';
import { runPendingMigrations } from '../services/sqlMigrationService';
import { formatCliError } from './formatCliError';

// Load env before migrations: backend/.env, then repo-root .env (common monorepo layout).
for (const envPath of [
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), '.env.local'),
    path.resolve(process.cwd(), '..', '.env'),
    path.resolve(process.cwd(), '..', '.env.local'),
]) {
    dotenv.config({ path: envPath });
}

const main = async () => {
    try {
        const applied = await runPendingMigrations();

        if (applied.length === 0) {
            console.log('✅ No pending SQL migrations');
            return;
        }

        console.log(`✅ Applied ${applied.length} SQL migration(s):`);
        applied.forEach((migration) => {
            console.log(`   - ${migration.name}`);
        });
    } catch (error: unknown) {
        console.error('❌ Migration run failed:', formatCliError(error));
        if (error instanceof Error && error.stack) {
            console.error(error.stack);
        }
        process.exit(1);
    }
};

void main();

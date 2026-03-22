import path from 'path';
import dotenv from 'dotenv';
import { getMigrationStatus } from '../services/sqlMigrationService';
import { formatCliError } from './formatCliError';

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
        const { applied, pending } = await getMigrationStatus();

        console.log(`Applied migrations: ${applied.length}`);
        console.log(`Pending migrations: ${pending.length}`);

        if (pending.length > 0) {
            pending.forEach((migration) => {
                console.log(` - ${migration.name}`);
            });
            process.exit(1);
        }

        console.log('✅ Database migration state is up to date');
    } catch (error: unknown) {
        console.error('❌ Migration status check failed:', formatCliError(error));
        if (error instanceof Error && error.stack) {
            console.error(error.stack);
        }
        process.exit(1);
    }
};

void main();

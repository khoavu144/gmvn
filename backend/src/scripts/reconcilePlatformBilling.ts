import path from 'path';
import dotenv from 'dotenv';
import { AppDataSource } from '../config/database';
import { platformSubscriptionService } from '../services/platformSubscriptionService';
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
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }

        const result = await platformSubscriptionService.reconcileCheckoutIntents();
        console.log(JSON.stringify(result, null, 2));
        process.exit(0);
    } catch (error) {
        console.error('❌ Billing reconciliation failed:', formatCliError(error));
        process.exit(1);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
};

void main();

import fs from 'fs';
import path from 'path';
import { Client } from 'pg';
import { getEnv } from '../config/env';

export interface SqlMigration {
    name: string;
    timestamp: number;
    filePath: string;
    sql: string;
}

const MIGRATIONS_TABLE = 'migrations';
const MIGRATIONS_DIR = path.resolve(__dirname, '../../migrations');

const compareMigrations = (a: SqlMigration, b: SqlMigration) => {
    if (a.timestamp === b.timestamp) {
        return a.name.localeCompare(b.name);
    }

    return a.timestamp - b.timestamp;
};

const createMigrationClient = () => {
    const env = getEnv();

    return new Client({
        connectionString: env.DATABASE_URL,
        ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
};

const ensureMigrationDirectoryExists = () => {
    if (!fs.existsSync(MIGRATIONS_DIR)) {
        throw new Error(`Migration directory not found: ${MIGRATIONS_DIR}`);
    }
};

const parseMigrationFilename = (filename: string): SqlMigration => {
    const match = filename.match(/^(\d+)[-_].+\.sql$/i);

    if (!match) {
        throw new Error(`Invalid migration filename format: ${filename}`);
    }

    const timestamp = Number.parseInt(match[1], 10);
    const filePath = path.join(MIGRATIONS_DIR, filename);
    const sql = fs.readFileSync(filePath, 'utf8');

    return {
        name: filename,
        timestamp,
        filePath,
        sql,
    };
};

export const loadExpectedMigrations = (): SqlMigration[] => {
    ensureMigrationDirectoryExists();

    return fs
        .readdirSync(MIGRATIONS_DIR)
        .filter((filename) => filename.toLowerCase().endsWith('.sql'))
        .map(parseMigrationFilename)
        .sort(compareMigrations);
};

const ensureMigrationsTable = async (client: Client) => {
    await client.query(`
        CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
            id SERIAL PRIMARY KEY,
            timestamp BIGINT NOT NULL,
            name VARCHAR(255) NOT NULL UNIQUE
        )
    `);
};

const getExecutedMigrationNames = async (client: Client): Promise<Set<string>> => {
    const result = await client.query<{ name: string }>(
        `SELECT name FROM ${MIGRATIONS_TABLE} ORDER BY timestamp ASC, name ASC`
    );

    return new Set(result.rows.map((row) => row.name));
};

export const getMigrationStatus = async () => {
    const client = createMigrationClient();
    await client.connect();

    try {
        await ensureMigrationsTable(client);

        const expected = loadExpectedMigrations();
        const executedNames = await getExecutedMigrationNames(client);
        const applied = expected.filter((migration) => executedNames.has(migration.name));
        const pending = expected.filter((migration) => !executedNames.has(migration.name));

        return {
            expected,
            applied,
            pending,
        };
    } finally {
        await client.end();
    }
};

export const assertNoPendingMigrations = async () => {
    const { pending } = await getMigrationStatus();

    if (pending.length > 0) {
        throw new Error(
            `Pending SQL migrations detected: ${pending
                .map((migration) => migration.name)
                .join(', ')}. Run "npm run migrate:run" before booting the app.`
        );
    }
};

export const runPendingMigrations = async (): Promise<SqlMigration[]> => {
    const client = createMigrationClient();
    await client.connect();

    try {
        await ensureMigrationsTable(client);

        const expected = loadExpectedMigrations();
        const executedNames = await getExecutedMigrationNames(client);
        const pending = expected.filter((migration) => !executedNames.has(migration.name));
        const applied: SqlMigration[] = [];

        for (const migration of pending) {
            await client.query('BEGIN');

            try {
                await client.query(migration.sql);
                await client.query(
                    `INSERT INTO ${MIGRATIONS_TABLE} (timestamp, name) VALUES ($1, $2) ON CONFLICT (name) DO NOTHING`,
                    [migration.timestamp, migration.name]
                );
                await client.query('COMMIT');
                applied.push(migration);
            } catch (error: any) {
                await client.query('ROLLBACK');
                throw new Error(`Failed to apply migration ${migration.name}: ${error.message}`);
            }
        }

        return applied;
    } finally {
        await client.end();
    }
};

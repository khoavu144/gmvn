import { getMigrationStatus, assertNoPendingMigrations } from '../services/sqlMigrationService';
import { Client } from 'pg';
import fs from 'fs';

jest.mock('pg', () => {
    const mClient = {
        connect: jest.fn(),
        query: jest.fn(),
        end: jest.fn()
    };
    return { Client: jest.fn(() => mClient) };
});

jest.mock('fs');

describe('Migration State Guard (Integrity Test)', () => {
    let mockClient: any;

    beforeEach(() => {
        jest.clearAllMocks();
        process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
        mockClient = new Client();
        (fs.existsSync as jest.Mock).mockReturnValue(true);
    });

    it('should detect when migrations are fully applied', async () => {
        // Mock files in directory
        (fs.readdirSync as jest.Mock).mockReturnValue(['001_initial.sql', '002_add_roles.sql']);
        (fs.readFileSync as jest.Mock).mockReturnValue('-- mock sql');

        // Two getMigrationStatus() runs (test + assertNoPendingMigrations): 2 queries each.
        const allAppliedRows = {
            rows: [{ name: '001_initial.sql' }, { name: '002_add_roles.sql' }],
        };
        mockClient.query
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce(allAppliedRows)
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce(allAppliedRows);

        const status = await getMigrationStatus();
        expect(status.expected.length).toBe(2);
        expect(status.applied.length).toBe(2);
        expect(status.pending.length).toBe(0);

        // assert should pass without throwing
        await expect(assertNoPendingMigrations()).resolves.toBeUndefined();
    });

    it('should detect missing/pending migrations and block launch', async () => {
        // Files present
        (fs.readdirSync as jest.Mock).mockReturnValue(['001_init.sql', '002_users.sql']);
        (fs.readFileSync as jest.Mock).mockReturnValue('-- sql');

        // DB ONLY has 1 applied (same 2-query pattern per getMigrationStatus call)
        const partialRows = { rows: [{ name: '001_init.sql' }] };
        mockClient.query
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce(partialRows)
            .mockResolvedValueOnce({ rows: [] })
            .mockResolvedValueOnce(partialRows);

        const status = await getMigrationStatus();
        expect(status.pending.length).toBe(1);
        expect(status.pending[0].name).toBe('002_users.sql');

        // assert should throw
        await expect(assertNoPendingMigrations()).rejects.toThrow('Pending SQL migrations detected');
    });

    it('should throw error if DB connection fails', async () => {
        mockClient.connect.mockRejectedValueOnce(new Error('Auth failed'));
        await expect(getMigrationStatus()).rejects.toThrow('Auth failed');
    });

    it('should throw error if migration folder missing', async () => {
        (fs.existsSync as jest.Mock).mockReturnValue(false);
        await expect(getMigrationStatus()).rejects.toThrow('Migration directory not found');
    });
});

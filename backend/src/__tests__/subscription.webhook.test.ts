/**
 * Unit tests: subscriptionService.handleSepayWebhook
 *
 * Critical-path coverage for:
 *  1. Happy path - subscription + client count + financial transaction created atomically
 *  2. Idempotency - duplicate webhook with same Sepay transaction ID is ignored
 *  3. Race condition guard - active subscription check inside transaction prevents double-signup
 *  4. Insufficient amount - webhook ignored when transferAmount < programAmount
 *  5. Non-GV transfer content - webhook ignored
 *  6. Outbound transfer (transferType !== 'in') - webhook ignored
 *  7. Unknown user or program prefix - webhook ignored
 *  8. Financial split calculation correctness
 */

import { subscriptionService } from '../services/subscriptionService';
import { AppDataSource } from '../config/database';

// ── Database mock ─────────────────────────────────────────────────────────────

jest.mock('../config/database', () => ({
    AppDataSource: {
        isInitialized: true,
        query: jest.fn(),
        transaction: jest.fn(),
        getRepository: jest.fn(),
    },
}));

// Silence notification side-effects — non-critical path in webhook handler
jest.mock('../services/notificationService', () => ({
    notificationService: { create: jest.fn().mockResolvedValue({}) },
}));
jest.mock('../socket', () => ({ getIo: jest.fn().mockReturnValue(null) }));

// ── Repo factories ────────────────────────────────────────────────────────────

const mockSubRepo = {
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
};
const mockProgramRepo = { increment: jest.fn() };
const mockFtRepo = {
    create: jest.fn(),
    save: jest.fn(),
};
const mockTierRepo = { findOneBy: jest.fn() };

function repoForEntity(entity: any) {
    const name = (entity?.name ?? '') as string;
    if (name === 'Subscription')        return mockSubRepo;
    if (name === 'Program')             return mockProgramRepo;
    if (name === 'FinancialTransaction') return mockFtRepo;
    if (name === 'RevenueTier')         return mockTierRepo;
    return {};
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('subscriptionService.handleSepayWebhook', () => {
    const basePayload = {
        id: 12345,
        transferType: 'in',
        content: 'GV ABCD1234 EFGH5678',
        transferAmount: 500000,
    };

    beforeEach(() => {
        jest.clearAllMocks();

        // getRepository used outside transaction (idempotency check)
        (AppDataSource.getRepository as jest.Mock).mockImplementation(repoForEntity);

        // prefix lookups
        (AppDataSource.query as jest.Mock).mockImplementation((sql: string) => {
            if (sql.includes('FROM users'))
                return Promise.resolve([{ id: 'user-uuid-1234' }]);
            if (sql.includes('FROM programs'))
                return Promise.resolve([{
                    id: 'prog-uuid-5678',
                    trainer_id: 'trainer-uuid-9999',
                    price_monthly: 500000,
                    price_one_time: null,
                    price_per_session: null,
                    pricing_type: 'monthly',
                }]);
            return Promise.resolve([]);
        });

        // Default: no prior record (idempotency / existing-sub checks both return null)
        mockSubRepo.findOneBy.mockResolvedValue(null);
        mockSubRepo.create.mockImplementation((d: any) => d);
        mockSubRepo.save.mockResolvedValue({ id: 'sub-new', ...{} });

        mockProgramRepo.increment.mockResolvedValue(undefined);

        mockFtRepo.create.mockImplementation((d: any) => d);
        mockFtRepo.save.mockResolvedValue({ id: 'ft-new' });

        mockTierRepo.findOneBy.mockResolvedValue(null); // default 95 % split

        // Inline-execute the transaction callback using same mock repos
        (AppDataSource.transaction as jest.Mock).mockImplementation(
            async (cb: (m: any) => Promise<any>) =>
                cb({ getRepository: repoForEntity }),
        );
    });

    // ── Happy path ──────────────────────────────────────────────────────────

    it('creates subscription, increments clients, and saves financial transaction', async () => {
        const result = await subscriptionService.handleSepayWebhook(basePayload);

        expect(result).toEqual({ success: true });
        expect(AppDataSource.transaction).toHaveBeenCalledTimes(1);
        expect(mockProgramRepo.increment).toHaveBeenCalledWith(
            { id: 'prog-uuid-5678' }, 'current_clients', 1,
        );
        expect(mockSubRepo.save).toHaveBeenCalledTimes(1);
        expect(mockFtRepo.save).toHaveBeenCalledTimes(1);
    });

    // ── Financial split ─────────────────────────────────────────────────────

    it('sets correct financial split: default 95 % trainer / 5 % platform', async () => {
        await subscriptionService.handleSepayWebhook(basePayload);

        const ftArg = mockFtRepo.create.mock.calls[0][0];
        expect(ftArg.split_percentage).toBe(95);
        expect(ftArg.platform_fee).toBeCloseTo(25000);   // 5 % of 500 000
        expect(ftArg.creator_amount).toBeCloseTo(475000);// 95 % of 500 000
    });

    it('uses custom revenue tier split when one exists for the trainer', async () => {
        mockTierRepo.findOneBy.mockResolvedValue({ creator_id: 'trainer-uuid-9999', split_percentage: 90 });

        await subscriptionService.handleSepayWebhook(basePayload);

        const ftArg = mockFtRepo.create.mock.calls[0][0];
        expect(ftArg.split_percentage).toBe(90);
        expect(ftArg.creator_amount).toBeCloseTo(450000);
    });

    // ── Idempotency ─────────────────────────────────────────────────────────

    it('ignores duplicate webhook — same sepay_transaction_id already in DB', async () => {
        // Outer (pre-transaction) idempotency check finds record
        mockSubRepo.findOneBy.mockResolvedValueOnce({ id: 'existing-sub' });

        const result = await subscriptionService.handleSepayWebhook(basePayload);

        expect(result).toEqual({ success: true });
        expect(AppDataSource.transaction).not.toHaveBeenCalled();
    });

    // ── Race condition ───────────────────────────────────────────────────────

    it('skips creation when a concurrent webhook already created the subscription (race guard inside txn)', async () => {
        mockSubRepo.findOneBy
            .mockResolvedValueOnce(null)               // outer idempotency: no prior record
            .mockResolvedValueOnce({ id: 'race-sub' }); // inside txn: already created

        const result = await subscriptionService.handleSepayWebhook(basePayload);

        expect(result).toEqual({ success: true });
        expect(mockSubRepo.save).not.toHaveBeenCalled();
        expect(mockFtRepo.save).not.toHaveBeenCalled();
    });

    // ── Amount validation ───────────────────────────────────────────────────

    it('ignores webhook when transferAmount < required program price', async () => {
        const result = await subscriptionService.handleSepayWebhook({
            ...basePayload,
            transferAmount: 100000,
        });

        expect(result).toEqual({ success: true });
        expect(AppDataSource.transaction).not.toHaveBeenCalled();
    });

    it('accepts webhook when transferAmount === required program price', async () => {
        const result = await subscriptionService.handleSepayWebhook({
            ...basePayload,
            transferAmount: 500000,
        });

        expect(result).toEqual({ success: true });
        expect(AppDataSource.transaction).toHaveBeenCalledTimes(1);
    });

    // ── Content filtering ───────────────────────────────────────────────────

    it('ignores outbound transfers (transferType !== "in")', async () => {
        const result = await subscriptionService.handleSepayWebhook({ ...basePayload, transferType: 'out' });

        expect(result).toEqual({ success: true });
        expect(AppDataSource.query).not.toHaveBeenCalled();
    });

    it('ignores transfers with empty content', async () => {
        const result = await subscriptionService.handleSepayWebhook({ ...basePayload, content: '' });

        expect(result).toEqual({ success: true });
        expect(AppDataSource.query).not.toHaveBeenCalled();
    });

    it('ignores transfers whose content does not contain "GV "', async () => {
        const result = await subscriptionService.handleSepayWebhook({
            ...basePayload,
            content: 'RANDOM PAYMENT REF 12345',
        });

        expect(result).toEqual({ success: true });
        expect(AppDataSource.query).not.toHaveBeenCalled();
    });

    it('ignores transfers with malformed GV prefix (only one token after GV)', async () => {
        const result = await subscriptionService.handleSepayWebhook({
            ...basePayload,
            content: 'GV ONLYONE',
        });

        expect(result).toEqual({ success: true });
        expect(AppDataSource.query).not.toHaveBeenCalled();
    });

    // ── Unknown entities ────────────────────────────────────────────────────

    it('ignores when no user matches the UUID prefix', async () => {
        (AppDataSource.query as jest.Mock).mockImplementation((sql: string) => {
            if (sql.includes('FROM users')) return Promise.resolve([]);
            return Promise.resolve([{ id: 'prog-uuid-5678', pricing_type: 'monthly', price_monthly: 500000 }]);
        });

        const result = await subscriptionService.handleSepayWebhook(basePayload);

        expect(result).toEqual({ success: true });
        expect(AppDataSource.transaction).not.toHaveBeenCalled();
    });

    it('ignores when no program matches the UUID prefix', async () => {
        (AppDataSource.query as jest.Mock).mockImplementation((sql: string) => {
            if (sql.includes('FROM programs')) return Promise.resolve([]);
            return Promise.resolve([{ id: 'user-uuid-1234' }]);
        });

        const result = await subscriptionService.handleSepayWebhook(basePayload);

        expect(result).toEqual({ success: true });
        expect(AppDataSource.transaction).not.toHaveBeenCalled();
    });
});


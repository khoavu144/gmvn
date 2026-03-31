/**
 * Unit tests for the relationship-oriented subscription service.
 *
 * The filename is kept for local compatibility, but these assertions
 * reflect the current free-platform model.
 */

import { AppDataSource } from '../config/database';
import { notificationService } from '../services/notificationService';
import { subscriptionService } from '../services/subscriptionService';

jest.mock('../config/database', () => ({
    AppDataSource: {
        getRepository: jest.fn(),
    },
}));

jest.mock('../services/notificationService', () => ({
    notificationService: {
        create: jest.fn().mockResolvedValue({ id: 'notif-1' }),
    },
}));

jest.mock('../socket', () => ({
    getIo: jest.fn().mockReturnValue(null),
}));

const mockSubRepo = {
    findOneBy: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
};

const mockProgramRepo = {
    findOneBy: jest.fn(),
    increment: jest.fn(),
    decrement: jest.fn(),
};

function repoForEntity(entity: any) {
    const name = (entity?.name ?? '') as string;
    if (name === 'Subscription') return mockSubRepo;
    if (name === 'Program') return mockProgramRepo;
    return {};
}

describe('subscriptionService relationship flows', () => {
    const activeProgram = {
        id: 'program-1',
        trainer_id: 'trainer-1',
        is_published: true,
    };

    const qb = {
        where: jest.fn(),
        andWhere: jest.fn(),
        getCount: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();

        (AppDataSource.getRepository as jest.Mock).mockImplementation(repoForEntity);

        qb.where.mockReturnValue(qb);
        qb.andWhere.mockReturnValue(qb);
        qb.getCount.mockResolvedValue(2);

        mockProgramRepo.findOneBy.mockResolvedValue(activeProgram);
        mockProgramRepo.increment.mockResolvedValue(undefined);
        mockProgramRepo.decrement.mockResolvedValue(undefined);

        mockSubRepo.findOneBy.mockResolvedValue(null);
        mockSubRepo.find.mockResolvedValue([]);
        mockSubRepo.create.mockImplementation((payload: any) => payload);
        mockSubRepo.save.mockImplementation(async (payload: any) => ({ id: 'sub-1', ...payload }));
        mockSubRepo.count.mockResolvedValue(4);
        mockSubRepo.createQueryBuilder.mockReturnValue(qb);

        (notificationService.create as jest.Mock).mockResolvedValue({ id: 'notif-1' });
    });

    it('creates an active relationship and increments current clients', async () => {
        const result = await subscriptionService.createRelationship('user-1', 'trainer-1', 'program-1');

        expect(mockSubRepo.create).toHaveBeenCalledWith(expect.objectContaining({
            user_id: 'user-1',
            trainer_id: 'trainer-1',
            program_id: 'program-1',
            subscription_type: 'one_time',
            status: 'active',
            source: 'message',
            notes: null,
            started_at: expect.any(Date),
        }));
        expect(mockProgramRepo.increment).toHaveBeenCalledWith({ id: 'program-1' }, 'current_clients', 1);
        expect(notificationService.create).toHaveBeenCalledWith(
            'trainer-1',
            'system',
            'Học viên mới',
            'Bạn có một học viên mới tham gia chương trình',
            '/dashboard'
        );
        expect(result).toMatchObject({ id: 'sub-1', status: 'active' });
    });

    it('supports direct handoff source with notes', async () => {
        await subscriptionService.createRelationship(
            'user-1',
            'trainer-1',
            'program-1',
            'direct',
            'Đã chốt lịch qua điện thoại'
        );

        expect(mockSubRepo.create).toHaveBeenCalledWith(expect.objectContaining({
            source: 'direct',
            notes: 'Đã chốt lịch qua điện thoại',
        }));
    });

    it('rejects when the program does not exist or is unpublished', async () => {
        mockProgramRepo.findOneBy.mockResolvedValue(null);

        await expect(
            subscriptionService.createRelationship('user-1', 'trainer-1', 'program-1')
        ).rejects.toThrow('Chương trình không tồn tại hoặc chưa được xuất bản');

        expect(mockSubRepo.findOneBy).not.toHaveBeenCalled();
    });

    it('rejects when an active relationship already exists for the same program', async () => {
        mockSubRepo.findOneBy.mockResolvedValue({ id: 'sub-existing', status: 'active' });

        await expect(
            subscriptionService.createRelationship('user-1', 'trainer-1', 'program-1')
        ).rejects.toThrow('Bạn đã có quan hệ huấn luyện cho chương trình này');

        expect(mockSubRepo.save).not.toHaveBeenCalled();
        expect(mockProgramRepo.increment).not.toHaveBeenCalled();
    });

    it('returns the user relationships in reverse chronological order', async () => {
        const rows = [{ id: 'sub-2' }, { id: 'sub-1' }];
        mockSubRepo.find.mockResolvedValue(rows);

        const result = await subscriptionService.getUserSubscriptions('user-1');

        expect(mockSubRepo.find).toHaveBeenCalledWith({
            where: { user_id: 'user-1' },
            relations: ['program', 'trainer'],
            order: { created_at: 'DESC' },
        });
        expect(result).toEqual(rows);
    });

    it('cancels an active relationship and decrements current clients', async () => {
        const activeRelationship = {
            id: 'sub-1',
            user_id: 'user-1',
            program_id: 'program-1',
            status: 'active',
            ended_at: null,
        };
        mockSubRepo.findOneBy.mockResolvedValue(activeRelationship);

        const result = await subscriptionService.cancelSubscription('user-1', 'sub-1');

        expect(mockProgramRepo.decrement).toHaveBeenCalledWith({ id: 'program-1' }, 'current_clients', 1);
        expect(result).toMatchObject({ status: 'cancelled', ended_at: expect.any(Date) });
    });

    it('rejects cancellation when the relationship does not exist', async () => {
        mockSubRepo.findOneBy.mockResolvedValue(null);

        await expect(subscriptionService.cancelSubscription('user-1', 'sub-404')).rejects.toThrow('Không tìm thấy quan hệ huấn luyện');
    });

    it('rejects cancellation when the relationship is already cancelled', async () => {
        mockSubRepo.findOneBy.mockResolvedValue({
            id: 'sub-1',
            user_id: 'user-1',
            program_id: 'program-1',
            status: 'cancelled',
        });

        await expect(subscriptionService.cancelSubscription('user-1', 'sub-1')).rejects.toThrow('Quan hệ huấn luyện này đã được kết thúc');
    });

    it('returns relationship-oriented trainer stats', async () => {
        const result = await subscriptionService.getTrainerStats('trainer-1');

        expect(mockSubRepo.count).toHaveBeenCalledWith({
            where: { trainer_id: 'trainer-1', status: 'active' },
        });
        expect(mockSubRepo.createQueryBuilder).toHaveBeenCalledWith('subscription');
        expect(result).toEqual({
            active_clients: 4,
            new_clients_30d: 2,
        });
    });
});


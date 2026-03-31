import { AppDataSource } from '../config/database';
import { messageService } from '../services/messageService';

const mockMessageRepo = {
    create: jest.fn(),
    save: jest.fn(),
};

jest.mock('../config/database', () => ({
    AppDataSource: {
        getRepository: jest.fn(),
    },
}));

describe('messageService context support', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (AppDataSource.getRepository as jest.Mock).mockReturnValue(mockMessageRepo);
        mockMessageRepo.create.mockImplementation((payload: unknown) => payload);
        mockMessageRepo.save.mockImplementation(async (payload: any) => ({
            id: 'message-1',
            is_read: false,
            created_at: new Date('2026-01-01T00:00:00.000Z'),
            ...payload,
        }));
    });

    it('persists optional message context when provided', async () => {
        const result = await messageService.sendMessage(
            '11111111-1111-4111-8111-111111111111',
            '22222222-2222-4222-8222-222222222222',
            'Xin chào, tôi muốn hỏi thêm về chương trình này.',
            {
                context_type: 'program',
                context_id: '33333333-3333-4333-8333-333333333333',
                context_label: 'Giảm mỡ 12 tuần',
            },
        );

        expect(mockMessageRepo.create).toHaveBeenCalledWith({
            sender_id: '11111111-1111-4111-8111-111111111111',
            receiver_id: '22222222-2222-4222-8222-222222222222',
            content: 'Xin chào, tôi muốn hỏi thêm về chương trình này.',
            context_type: 'program',
            context_id: '33333333-3333-4333-8333-333333333333',
            context_label: 'Giảm mỡ 12 tuần',
        });
        expect(result).toMatchObject({
            context_type: 'program',
            context_id: '33333333-3333-4333-8333-333333333333',
            context_label: 'Giảm mỡ 12 tuần',
        });
    });

    it('omits message context when it is incomplete', async () => {
        await messageService.sendMessage(
            '11111111-1111-4111-8111-111111111111',
            '22222222-2222-4222-8222-222222222222',
            'Xin chào',
            {
                context_type: 'product',
            },
        );

        expect(mockMessageRepo.create).toHaveBeenCalledWith({
            sender_id: '11111111-1111-4111-8111-111111111111',
            receiver_id: '22222222-2222-4222-8222-222222222222',
            content: 'Xin chào',
            context_type: null,
            context_id: null,
            context_label: null,
        });
    });
});
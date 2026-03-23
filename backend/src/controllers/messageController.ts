import { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { getSingleParam, requireRequestUserId } from '../utils/controllerUtils';
import { messageService } from '../services/messageService';

const sendMessageSchema = z.object({
    receiver_id: z.string().uuid('Invalid receiver ID'),
    content: z
        .string()
        .trim()
        .min(1, 'Nội dung tin nhắn không được để trống')
        .max(2000, 'Nội dung tin nhắn vượt quá giới hạn 2000 ký tự'),
});

export const getConversations = asyncHandler(async (req: Request, res: Response) => {
    const userId = requireRequestUserId(req);
    const conversations = await messageService.getConversations(userId);
    res.json({ success: true, conversations });
});

export const getMessages = asyncHandler(async (req: Request, res: Response) => {
    const userId = requireRequestUserId(req);
    const partnerId = getSingleParam(req.params.partnerId);
    const limit = parseInt(String(req.query.limit ?? '30'), 10) || 30;
    const offset = parseInt(String(req.query.offset ?? '0'), 10) || 0;

    const messages = await messageService.getMessages(userId, partnerId, limit, offset);
    res.json({ success: true, messages });
});

export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
    const userId = requireRequestUserId(req);
    const parseResult = sendMessageSchema.safeParse(req.body);

    if (!parseResult.success) {
        throw new AppError(
            parseResult.error.issues?.[0]?.message || 'Dữ liệu không hợp lệ',
            400,
            'MESSAGE_VALIDATION_ERROR',
        );
    }

    const { receiver_id, content } = parseResult.data;
    const message = await messageService.sendMessage(userId, receiver_id, content);
    res.status(201).json({ success: true, message });
});

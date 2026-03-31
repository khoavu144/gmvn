import { Request, Response } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../utils/asyncHandler';
import { AppError } from '../utils/AppError';
import { getSingleParam, requireRequestUserId } from '../utils/controllerUtils';
import { messageService } from '../services/messageService';

const MESSAGE_CONTEXT_TYPES = ['program', 'product', 'gym', 'profile'] as const;

const sendMessageSchema = z.object({
    receiver_id: z.string().uuid('Invalid receiver ID'),
    content: z
        .string()
        .trim()
        .min(1, 'Nội dung tin nhắn không được để trống')
        .max(2000, 'Nội dung tin nhắn vượt quá giới hạn 2000 ký tự'),
    context_type: z.enum(MESSAGE_CONTEXT_TYPES).optional(),
    context_id: z.string().uuid('Ngữ cảnh liên kết không hợp lệ').optional(),
    context_label: z
        .string()
        .trim()
        .max(255, 'Nhãn ngữ cảnh vượt quá giới hạn 255 ký tự')
        .optional(),
}).superRefine((value, ctx) => {
    const hasContextType = Boolean(value.context_type);
    const hasContextId = Boolean(value.context_id);

    if (hasContextType !== hasContextId) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [hasContextType ? 'context_id' : 'context_type'],
            message: 'Ngữ cảnh tin nhắn phải có đủ loại và mã liên kết',
        });
    }
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

    const { receiver_id, content, context_type, context_id, context_label } = parseResult.data;
    const message = await messageService.sendMessage(userId, receiver_id, content, {
        context_type,
        context_id,
        context_label,
    });
    res.status(201).json({ success: true, message });
});

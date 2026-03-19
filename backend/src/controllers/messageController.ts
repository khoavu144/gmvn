import { Request, Response } from 'express';
import { messageService } from '../services/messageService';
import { z } from 'zod';

const sendMessageSchema = z.object({
    receiver_id: z.string().uuid('Invalid receiver ID'),
    content: z.string().trim().min(1, 'Nội dung tin nhắn không được để trống').max(2000, 'Nội dung tin nhắn vượt quá giới hạn 2000 ký tự')
});

export const getConversations = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.user_id;
        const conversations = await messageService.getConversations(userId);
        res.json({ success: true, conversations });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const getMessages = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.user_id;
        const { partnerId } = req.params;
        const limit = parseInt(req.query.limit as string) || 30;
        const offset = parseInt(req.query.offset as string) || 0;

        const messages = await messageService.getMessages(userId, String(partnerId), limit, offset);
        res.json({ success: true, messages });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const sendMessage = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.user_id;
        // P0-5: Validate message content length and format
        const parseResult = sendMessageSchema.safeParse(req.body);
        if (!parseResult.success) {
            return res.status(400).json({ 
                error: parseResult.error.issues ? parseResult.error.issues[0].message : 'Dữ liệu không hợp lệ'
            });
        }
        
        const { receiver_id, content } = parseResult.data;

        const message = await messageService.sendMessage(userId, receiver_id, content);
        res.status(201).json({ success: true, message });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

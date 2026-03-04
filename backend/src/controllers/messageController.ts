import { Request, Response } from 'express';
import { messageService } from '../services/messageService';

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
        const { receiver_id, content } = req.body;
        if (!receiver_id || !content) {
            return res.status(400).json({ error: 'receiver_id and content are required' });
        }

        const message = await messageService.sendMessage(userId, receiver_id, content);
        res.status(201).json({ success: true, message });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

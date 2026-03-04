import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { getConversations, getMessages, sendMessage } from '../controllers/messageController';

const router = Router();

router.get('/conversations', authenticate, getConversations);
router.get('/conversations/:partnerId', authenticate, getMessages);
router.post('/send', authenticate, sendMessage);

export default router;

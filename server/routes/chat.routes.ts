import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { validateMessage } from '../middleware/validation';

export const chatRouter = Router();
const chatController = new ChatController();

// Send a message and get AI response
chatRouter.post('/message', validateMessage, chatController.sendMessage);

// Get conversation history
chatRouter.get('/history/:sessionId', chatController.getHistory);

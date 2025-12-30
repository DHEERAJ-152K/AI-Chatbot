import { Request, Response, NextFunction } from 'express';
import { ChatService } from '../services/chat.service';
import { v4 as uuidv4 } from 'uuid';

export class ChatController {
  private chatService: ChatService;

  constructor() {
    this.chatService = new ChatService();
  }

  sendMessage = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { message, sessionId } = req.body;
      
      // Generate or use existing session ID
      const activeSessionId = sessionId || uuidv4();
      
      // Process the message and get AI response
      const reply = await this.chatService.processMessage(
        activeSessionId,
        message
      );

      res.json({
        reply,
        sessionId: activeSessionId
      });
    } catch (error) {
      next(error);
    }
  };

  getHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId } = req.params;
      
      const messages = await this.chatService.getConversationHistory(sessionId);
      
      res.json({
        sessionId,
        messages
      });
    } catch (error) {
      next(error);
    }
  };
}

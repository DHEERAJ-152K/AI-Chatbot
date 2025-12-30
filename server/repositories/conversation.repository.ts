import { db } from '../db/database';
import { Conversation } from '../types';

export class ConversationRepository {
  async getOrCreate(sessionId: string): Promise<Conversation> {
    const existing = await db.getConversation(sessionId);
    
    if (existing) {
      return existing;
    }

    const newConversation: Conversation = {
      id: sessionId,
      createdAt: new Date().toISOString()
    };

    await db.createConversation(newConversation);
    return newConversation;
  }

  async getById(sessionId: string): Promise<Conversation | null> {
    return await db.getConversation(sessionId);
  }
}

import { db } from '../db/database';
import { Message, MessageInput } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class MessageRepository {
  async create(input: MessageInput): Promise<Message> {
    const message: Message = {
      id: uuidv4(),
      conversationId: input.conversationId,
      sender: input.sender,
      text: input.text,
      timestamp: new Date().toISOString()
    };

    db.createMessage(message);
    return message;
  }

  async getByConversation(conversationId: string): Promise<Message[]> {
    return db.getMessages(conversationId);
  }
}
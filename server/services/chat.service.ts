import { ConversationRepository } from '../repositories/conversation.repository';
import { MessageRepository } from '../repositories/message.repository';
import { GeminiService } from './llm.service';
import { Message } from '../types';

export class ChatService {
  private conversationRepo: ConversationRepository;
  private messageRepo: MessageRepository;
  private llmService: GeminiService;

  constructor() {
    this.conversationRepo = new ConversationRepository();
    this.messageRepo = new MessageRepository();
    this.llmService = new GeminiService();
  }

  async processMessage(sessionId: string, userMessage: string): Promise<string> {
    // Ensure conversation exists
    await this.conversationRepo.getOrCreate(sessionId);

    // Save user message
    await this.messageRepo.create({
      conversationId: sessionId,
      sender: 'user',
      text: userMessage
    });

    // Get conversation histoy for context
    const history = await this.messageRepo.getByConversation(sessionId);

    // Generate AI response
    const aiReply = await this.llmService.generateReply(history, userMessage);

    // Save AI response
    await this.messageRepo.create({
      conversationId: sessionId,
      sender: 'ai',
      text: aiReply
    });

    return aiReply;
  }

  async getConversationHistory(sessionId: string): Promise<Message[]> {
    return this.messageRepo.getByConversation(sessionId);
  }
}
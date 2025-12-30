export interface Conversation {
  id: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface MessageInput {
  conversationId: string;
  sender: 'user' | 'ai';
  text: string;
}
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Message } from '../types';
import dotenv from 'dotenv';


dotenv.config();

const LLM_MODEL = process.env.GOOGLE_GEMINI_MODEL || "gemini-2.5-flash";

const STORE_KNOWLEDGE = `You are a helpful support agent for "TechHub Store", an e-commerce electronics retailer.

KEY STORE INFORMATION:

SHIPPING POLICY:
- Domestic (USA): Free shipping on orders over $50, otherwise $5.99 flat rate
- International: Available to 50+ countries, calculated at checkout (typically $15-$30)
- Processing time: 1-2 business days
- Delivery: 3-5 business days domestic, 7-14 days international
- Express shipping available for $19.99 (1-2 days domestic)

RETURN & REFUND POLICY:
- 30-day return window from delivery date
- Items must be unused, in original packaging with all accessories
- Free return shipping within USA
- Full refund issued within 5-7 business days after receiving return
- Opened software and digital products are non-returnable
- Sale items: final sale, no returns

SUPPORT HOURS:
- Email support: 24/7 (response within 24 hours)
- Live chat: Monday-Friday 9 AM - 6 PM EST
- Phone support: Monday-Friday 10 AM - 5 PM EST at 1-800-TECHHUB

PAYMENT METHODS:
- Credit/Debit cards (Visa, Mastercard, Amex, Discover)
- PayPal, Apple Pay, Google Pay
- Buy Now Pay Later options available (Affirm, Klarna)

WARRANTY:
- All products come with manufacturer warranty (typically 1 year)
- Extended warranty available for purchase at checkout
- Defective items: free replacement or repair within warranty period

Answer customer questions clearly, concisely, and helpfully. If you don't know something, admit it and offer to connect them with a specialist. Be friendly and professional.`;

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private maxHistoryMessages = 10; // Limit context for cost control

  constructor() {
    const apiKey = process.env.API
    
    if (!apiKey) {
      throw new Error('GOOGLE_API_KEY is required but not set in environment');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: LLM_MODEL,
      systemInstruction: STORE_KNOWLEDGE
    });
  }

  async generateReply(history: Message[], currentMessage: string): Promise<string> {
    try {
      // Prepare conversation history (limit to recent messages)
      const recentHistory = history.slice(-this.maxHistoryMessages);
      
      // Build chat history in Gemini format
      const chatHistory = recentHistory.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      // Start a chat session with history
      const chat = this.model.startChat({
        history: chatHistory,
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        },
      });

      // Send the current message
      const result = await chat.sendMessage(currentMessage);
      const response = await result.response;
      const text = response.text();

      if (!text || text.trim().length === 0) {
        return 'I apologize, but I had trouble generating a response. Could you please try rephrasing your question?';
      }

      return text;

    } catch (error: any) {
      console.error('Gemini API Error:', error);

      // Handle specific error types
      if (error.message?.includes('API_KEY_INVALID')) {
        throw new Error('Authentication failed. Please check your Google API key.');
      } else if (error.message?.includes('RATE_LIMIT_EXCEEDED')) {
        throw new Error('Rate limit exceeded. Please try again in a moment.');
      } else if (error.message?.includes('SAFETY')) {
        return 'I apologize, but I cannot generate a response to that message. Please try asking something else.';
      } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
        throw new Error('Unable to connect to AI service. Please try again.');
      }

      throw new Error('AI service temporarily unavailable. Please try again shortly.');
    }
  }
}

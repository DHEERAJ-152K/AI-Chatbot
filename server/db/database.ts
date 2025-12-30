import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import { Conversation, Message } from '../types';
import path from 'path';

class SQLiteDatabase {
  private db: Database | null = null;

  async initialize(): Promise<void> {
    try {
      // Open database connection
      this.db = await open({
        filename: path.join(process.cwd(), 'chat.db'),
        driver: sqlite3.Database
      });

      // Enable foreign keys
      await this.db.exec('PRAGMA foreign_keys = ON;');

      // Create tables
      await this.createTables();

      console.log('SQLite database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Create conversations table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS conversations (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        metadata TEXT DEFAULT '{}'
      );
    `);

    // Create messages table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        sender TEXT NOT NULL CHECK(sender IN ('user', 'ai')),
        text TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
      );
    `);

    // Create indexes for performance
    await this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_messages_conversation_id 
      ON messages(conversation_id);
    `);

    await this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_messages_timestamp 
      ON messages(timestamp);
    `);
  }

  async createConversation(conversation: Conversation): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.run(
      'INSERT OR IGNORE INTO conversations (id, created_at, metadata) VALUES (?, ?, ?)',
      [conversation.id, conversation.createdAt, JSON.stringify(conversation.metadata || {})]
    );
  }

  async getConversation(id: string): Promise<Conversation | null> {
    if (!this.db) throw new Error('Database not initialized');

    const row = await this.db.get(
      'SELECT id, created_at as createdAt, metadata FROM conversations WHERE id = ?',
      [id]
    );

    if (!row) return null;

    return {
      id: row.id,
      createdAt: row.createdAt,
      metadata: JSON.parse(row.metadata || '{}')
    };
  }

  async createMessage(message: Message): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.run(
      'INSERT INTO messages (id, conversation_id, sender, text, timestamp) VALUES (?, ?, ?, ?, ?)',
      [message.id, message.conversationId, message.sender, message.text, message.timestamp]
    );
  }

  async getMessages(conversationId: string): Promise<Message[]> {
    if (!this.db) throw new Error('Database not initialized');

    const rows = await this.db.all(
      `SELECT id, conversation_id as conversationId, sender, text, timestamp 
       FROM messages 
       WHERE conversation_id = ? 
       ORDER BY timestamp ASC`,
      [conversationId]
    );

    return rows;
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}

export const db = new SQLiteDatabase();

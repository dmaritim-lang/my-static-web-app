import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';

interface SessionRecord<T = any> {
  state: T;
  expiresAt: number;
}

@Injectable()
export class UssdSessionStore<T = any> {
  private readonly logger = new Logger(UssdSessionStore.name);
  private client: Redis | null = null;
  private readonly memory = new Map<string, SessionRecord<T>>();

  constructor() {
    const url = process.env.REDIS_URL;
    if (url) {
      try {
        this.client = new Redis(url, { lazyConnect: true });
        this.client.connect().catch((err) => {
          this.logger.warn(`Redis connection failed, using in-memory store. ${err.message}`);
          this.client = null;
        });
      } catch (error: any) {
        this.logger.warn(`Redis init error, using in-memory store. ${error.message}`);
        this.client = null;
      }
    }
  }

  async get(sessionId: string): Promise<T | null> {
    if (this.client) {
      const data = await this.client.get(sessionId);
      return data ? (JSON.parse(data) as T) : null;
    }
    const record = this.memory.get(sessionId);
    if (!record) return null;
    if (record.expiresAt < Date.now()) {
      this.memory.delete(sessionId);
      return null;
    }
    return record.state;
  }

  async set(sessionId: string, state: T, ttlSeconds = 300) {
    if (this.client) {
      await this.client.set(sessionId, JSON.stringify(state), 'EX', ttlSeconds);
      return;
    }
    this.memory.set(sessionId, { state, expiresAt: Date.now() + ttlSeconds * 1000 });
  }

  async clear(sessionId: string) {
    if (this.client) {
      await this.client.del(sessionId);
      return;
    }
    this.memory.delete(sessionId);
  }
}

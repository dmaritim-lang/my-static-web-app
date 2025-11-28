import { Injectable } from '@nestjs/common';
import { InMemoryStore, LedgerEntry } from '../common/in-memory.store';

@Injectable()
export class LedgerService {
  constructor(private readonly store: InMemoryStore) {}

  record(reference: string, description: string, debitAccountId: string, creditAccountId: string, amount: number, metadata?: Record<string, string>): LedgerEntry {
    if (amount <= 0) {
      throw new Error('Ledger amount must be positive');
    }
    return this.store.addLedgerEntry({ reference, description, debitAccountId, creditAccountId, amount, metadata });
  }

  list() {
    return this.store.ledger.map((entry) => ({ ...entry }));
  }
}

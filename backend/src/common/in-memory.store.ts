import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';

export interface User {
  id: string;
  phone: string;
  password: string;
  role: 'passenger' | 'owner' | 'sacco_admin';
}

export interface Vehicle {
  id: string;
  plate: string;
  ownerId: string;
  saccoId?: string;
  splitRules: SplitRule[];
}

export interface SplitRule {
  label: string;
  percentage: number;
  accountType: WalletAccountType;
}

export type WalletAccountType =
  | 'platform_commission'
  | 'platform_loyalty_pool'
  | 'c2b_clearing'
  | 'owner_main'
  | 'mpesa_c2b_pool'
  | 'mpesa_b2c_pool'
  | 'mpesa_b2b_pool'
  | 'fuel'
  | 'maintenance'
  | 'sacco'
  | 'insurance'
  | 'loan'
  | 'profit'
  | 'loyalty';

export interface WalletAccount {
  id: string;
  ownerId: string;
  vehicleId?: string;
  type: WalletAccountType;
  balance: number;
}

export interface LedgerEntry {
  id: string;
  reference: string;
  description: string;
  debitAccountId: string;
  creditAccountId: string;
  amount: number;
  createdAt: Date;
  metadata?: Record<string, string>;
}

export interface PaymentRecord {
  id: string;
  mpesaReference: string;
  vehicleId?: string;
  passengerPhone?: string;
  amount: number;
  direction: 'c2b' | 'b2c' | 'b2b';
  status: 'pending' | 'successful' | 'failed';
  createdAt: Date;
  metadata?: Record<string, string>;
}

@Injectable()
export class InMemoryStore {
  users: User[] = [];
  vehicles: Vehicle[] = [];
  accounts: WalletAccount[] = [];
  ledger: LedgerEntry[] = [];
  payments: PaymentRecord[] = [];

  createUser(phone: string, password: string, role: User['role']): User {
    const user: User = { id: uuid(), phone, password, role };
    this.users.push(user);
    return user;
  }

  createVehicle(ownerId: string, plate: string, saccoId: string | undefined, splitRules: SplitRule[]): Vehicle {
    const vehicle: Vehicle = { id: uuid(), ownerId, plate, saccoId, splitRules };
    this.vehicles.push(vehicle);
    return vehicle;
  }

  createAccount(ownerId: string, type: WalletAccountType, vehicleId?: string, balance = 0): WalletAccount {
    const account: WalletAccount = { id: uuid(), ownerId, type, vehicleId, balance };
    this.accounts.push(account);
    return account;
  }

  addLedgerEntry(entry: Omit<LedgerEntry, 'id' | 'createdAt'>): LedgerEntry {
    const record: LedgerEntry = Object.freeze({ ...entry, id: uuid(), createdAt: new Date() });
    this.ledger.push(record);
    return record;
  }

  recordPayment(payment: Omit<PaymentRecord, 'id' | 'createdAt'>): PaymentRecord {
    const record: PaymentRecord = { ...payment, id: uuid(), createdAt: new Date() };
    this.payments.push(record);
    return record;
  }
}

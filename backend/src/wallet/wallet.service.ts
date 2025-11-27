import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InMemoryStore, Vehicle, WalletAccount, WalletAccountType } from '../common/in-memory.store';
import { LedgerService } from '../ledger/ledger.service';

@Injectable()
export class WalletService {
  constructor(private readonly store: InMemoryStore, private readonly ledger: LedgerService) {}

  private ensurePlatformAccount(): WalletAccount {
    return this.ensureAccount('platform', 'platform_commission');
  }

  private ensurePlatformLoyaltyPool(): WalletAccount {
    return this.ensureAccount('platform', 'platform_loyalty_pool', undefined, 1_000_000);
  }

  private ensureC2BClearing(): WalletAccount {
    return this.ensureAccount('platform', 'c2b_clearing', undefined, 1_000_000);
  }

  ensureMpesaAccount(type: Extract<WalletAccountType, 'mpesa_c2b_pool' | 'mpesa_b2c_pool' | 'mpesa_b2b_pool'>) {
    return this.ensureAccount('mpesa', type);
  }

  ensureOwnerAccounts(ownerId: string): WalletAccount {
    return this.ensureAccount(ownerId, 'owner_main');
  }

  ensureVehicleAccounts(vehicle: Vehicle) {
    const ownerMain = this.ensureOwnerAccounts(vehicle.ownerId);
    const subWalletTypes: WalletAccountType[] = ['fuel', 'maintenance', 'sacco', 'insurance', 'loan', 'profit'];
    subWalletTypes.forEach((type) => this.ensureAccount(vehicle.ownerId, type, vehicle.id));

    vehicle.splitRules.forEach((rule) => {
      this.ensureAccount(vehicle.ownerId, rule.accountType, vehicle.id);
    });

    return ownerMain;
  }

  getAccount(ownerId: string, type: WalletAccountType, vehicleId?: string): WalletAccount {
    const account = this.store.accounts.find(
      (a) => a.ownerId === ownerId && a.type === type && (vehicleId ? a.vehicleId === vehicleId : true),
    );
    if (!account) {
      throw new NotFoundException('Account not found');
    }
    return account;
  }

  private ensureAccount(ownerId: string, type: WalletAccountType, vehicleId?: string, seedBalance = 0) {
    let account = this.store.accounts.find(
      (a) => a.ownerId === ownerId && a.type === type && (vehicleId ? a.vehicleId === vehicleId : !a.vehicleId),
    );
    if (!account) {
      account = this.store.createAccount(ownerId, type, vehicleId, seedBalance);
    }
    return account;
  }

  transfer(fromAccountId: string, toAccountId: string, amount: number, reference: string, description: string) {
    if (amount <= 0) {
      throw new BadRequestException('Transfer amount must be positive');
    }

    const from = this.store.accounts.find((a) => a.id === fromAccountId);
    const to = this.store.accounts.find((a) => a.id === toAccountId);

    if (!from || !to) {
      throw new NotFoundException('Account not found for transfer');
    }

    from.balance -= amount;
    to.balance += amount;
    this.ledger.record(reference, description, from.id, to.id, amount);
  }

  allocateFare(vehicle: Vehicle, amount: number, mpesaReference: string, passengerPhone?: string) {
    if (amount <= 0) {
      throw new BadRequestException('Fare amount must be positive');
    }

    const collection = this.ensureMpesaAccount('mpesa_c2b_pool');
    const clearing = this.ensureC2BClearing();

    // Reflect the incoming M-Pesa payment into the platform before allocating further.
    this.transfer(clearing.id, collection.id, amount, mpesaReference, 'C2B collection');

    this.applySplits(collection.id, vehicle, amount, mpesaReference, passengerPhone);
  }

  payOut(ownerId: string, amount: number, reference: string, description: string, channel: 'mpesa_b2c_pool' | 'mpesa_b2b_pool') {
    const source = this.ensureOwnerAccounts(ownerId);
    const settlement = this.ensureMpesaAccount(channel);
    this.transfer(source.id, settlement.id, amount, reference, description);
  }

  balancesForOwner(ownerId: string) {
    return this.store.accounts.filter((a) => a.ownerId === ownerId);
  }

  redeemWithLoyalty(vehicle: Vehicle, passengerPhone: string, points: number, reference: string) {
    if (points <= 0) {
      throw new BadRequestException('Points must be positive');
    }
    const loyalty = this.ensureAccount(passengerPhone, 'loyalty');
    if (loyalty.balance < points) {
      throw new BadRequestException('Insufficient loyalty balance');
    }

    const ownerMain = this.ensureOwnerAccounts(vehicle.ownerId);
    this.transfer(loyalty.id, ownerMain.id, points, reference, 'Loyalty fare redemption');
    this.allocateSubWallets(vehicle, points, ownerMain.id, reference, 'Loyalty split');
  }

  private applySplits(
    sourceAccountId: string,
    vehicle: Vehicle,
    amount: number,
    mpesaReference: string,
    passengerPhone?: string,
  ) {
    this.ensureVehicleAccounts(vehicle);
    const platformAccount = this.ensurePlatformAccount();
    const ownerMain = this.ensureOwnerAccounts(vehicle.ownerId);

    const commissionRule = vehicle.splitRules.find((r) => r.accountType === 'platform_commission');
    const commission = commissionRule ? (commissionRule.percentage / 100) * amount : 0;

    const otherSplits = vehicle.splitRules.filter((r) => r.accountType !== 'platform_commission');
    const allocationTotal = otherSplits.reduce((sum, rule) => sum + (rule.percentage / 100) * amount, 0);
    const net = amount - commission;

    if (net <= 0) {
      throw new BadRequestException('Commission exceeds fare amount');
    }
    if (allocationTotal > net) {
      throw new BadRequestException('Split configuration exceeds available funds');
    }

    if (commission > 0) {
      this.transfer(sourceAccountId, platformAccount.id, commission, mpesaReference, 'Platform commission');
    }

    if (net > 0) {
      this.transfer(sourceAccountId, ownerMain.id, net, mpesaReference, 'Owner master allocation');
    }

    this.allocateSubWallets(vehicle, amount, ownerMain.id, mpesaReference, 'Sub-wallet allocation');

    if (passengerPhone) {
      this.awardLoyalty(passengerPhone, amount, mpesaReference);
    }
  }

  private allocateSubWallets(vehicle: Vehicle, amount: number, ownerMainAccountId: string, reference: string, note: string) {
    const otherSplits = vehicle.splitRules.filter((r) => r.accountType !== 'platform_commission');
    otherSplits.forEach((rule) => {
      const allocation = (rule.percentage / 100) * amount;
      if (allocation <= 0) return;
      const account = this.getAccount(vehicle.ownerId, rule.accountType, vehicle.id);
      this.transfer(ownerMainAccountId, account.id, allocation, reference, `${note}: ${rule.label}`);
    });
  }

  private awardLoyalty(passengerPhone: string, amount: number, reference: string) {
    const points = Math.floor(amount / 10);
    if (points <= 0) return;

    const pool = this.ensurePlatformLoyaltyPool();
    const loyalty = this.ensureAccount(passengerPhone, 'loyalty');
    this.transfer(pool.id, loyalty.id, points, reference, 'Loyalty points awarded');
  }
}

"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const common_1 = require("@nestjs/common");
const in_memory_store_1 = require("../common/in-memory.store");
const ledger_service_1 = require("../ledger/ledger.service");
let WalletService = class WalletService {
    constructor(store, ledger) {
        this.store = store;
        this.ledger = ledger;
    }
    ensurePlatformAccount() {
        let account = this.store.accounts.find((a) => a.ownerId === 'platform' && a.type === 'platform_commission');
        if (!account) {
            account = this.store.createAccount('platform', 'platform_commission');
        }
        return account;
    }
    ensureOwnerAccounts(ownerId) {
        let main = this.store.accounts.find((a) => a.ownerId === ownerId && a.type === 'owner_main');
        if (!main) {
            main = this.store.createAccount(ownerId, 'owner_main');
        }
        return main;
    }
    ensureVehicleAccounts(vehicle) {
        this.ensureOwnerAccounts(vehicle.ownerId);
        vehicle.splitRules.forEach((rule) => {
            let account = this.store.accounts.find((a) => a.ownerId === vehicle.ownerId && a.vehicleId === vehicle.id && a.type === rule.accountType);
            if (!account) {
                account = this.store.createAccount(vehicle.ownerId, rule.accountType, vehicle.id);
            }
            return account;
        });
    }
    getAccount(ownerId, type, vehicleId) {
        const account = this.store.accounts.find((a) => a.ownerId === ownerId && a.type === type && (vehicleId ? a.vehicleId === vehicleId : true));
        if (!account) {
            throw new common_1.NotFoundException('Account not found');
        }
        return account;
    }
    credit(accountId, amount, reference, description, sourceAccountId) {
        const account = this.store.accounts.find((a) => a.id === accountId);
        if (!account) {
            throw new common_1.NotFoundException('Account not found');
        }
        account.balance += amount;
        this.ledger.record(reference, description, sourceAccountId, accountId, amount);
    }
    debit(accountId, amount, reference, description, targetAccountId) {
        const account = this.store.accounts.find((a) => a.id === accountId);
        if (!account) {
            throw new common_1.NotFoundException('Account not found');
        }
        account.balance -= amount;
        this.ledger.record(reference, description, accountId, targetAccountId, amount);
    }
    allocateFare(vehicle, amount, mpesaReference) {
        const platformAccount = this.ensurePlatformAccount();
        const ownerMain = this.ensureOwnerAccounts(vehicle.ownerId);
        const source = 'mpesa-c2b';
        const sourceAccount = this.store.createAccount(source, 'owner_main');
        this.ledger.record(mpesaReference, 'C2B received', sourceAccount.id, platformAccount.id, amount);
        const commissionRule = vehicle.splitRules.find((r) => r.accountType === 'platform_commission');
        const commission = commissionRule ? (commissionRule.percentage / 100) * amount : 0;
        if (commission > 0) {
            platformAccount.balance += commission;
            this.ledger.record(mpesaReference, 'Platform commission', platformAccount.id, platformAccount.id, commission);
        }
        const net = amount - commission;
        ownerMain.balance += net;
        this.ledger.record(mpesaReference, 'Owner net allocation', platformAccount.id, ownerMain.id, net);
        vehicle.splitRules
            .filter((r) => r.accountType !== 'platform_commission')
            .forEach((rule) => {
            const allocation = (rule.percentage / 100) * amount;
            if (allocation <= 0)
                return;
            const account = this.getAccount(vehicle.ownerId, rule.accountType, vehicle.id);
            account.balance += allocation;
            this.ledger.record(mpesaReference, `${rule.label} allocation`, ownerMain.id, account.id, allocation);
        });
    }
    balancesForOwner(ownerId) {
        return this.store.accounts.filter((a) => a.ownerId === ownerId);
    }
};
exports.WalletService = WalletService;
exports.WalletService = WalletService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [in_memory_store_1.InMemoryStore, ledger_service_1.LedgerService])
], WalletService);
//# sourceMappingURL=wallet.service.js.map
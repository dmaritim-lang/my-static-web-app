"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryStore = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
let InMemoryStore = class InMemoryStore {
    constructor() {
        this.users = [];
        this.vehicles = [];
        this.accounts = [];
        this.ledger = [];
        this.payments = [];
    }
    createUser(phone, password, role) {
        const user = { id: (0, uuid_1.v4)(), phone, password, role };
        this.users.push(user);
        return user;
    }
    createVehicle(ownerId, plate, saccoId, splitRules) {
        const vehicle = { id: (0, uuid_1.v4)(), ownerId, plate, saccoId, splitRules };
        this.vehicles.push(vehicle);
        return vehicle;
    }
    createAccount(ownerId, type, vehicleId) {
        const account = { id: (0, uuid_1.v4)(), ownerId, type, vehicleId, balance: 0 };
        this.accounts.push(account);
        return account;
    }
    addLedgerEntry(entry) {
        const record = { ...entry, id: (0, uuid_1.v4)(), createdAt: new Date() };
        this.ledger.push(record);
        return record;
    }
    recordPayment(payment) {
        const record = { ...payment, id: (0, uuid_1.v4)(), createdAt: new Date() };
        this.payments.push(record);
        return record;
    }
};
exports.InMemoryStore = InMemoryStore;
exports.InMemoryStore = InMemoryStore = __decorate([
    (0, common_1.Injectable)()
], InMemoryStore);
//# sourceMappingURL=in-memory.store.js.map
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
exports.VehiclesService = void 0;
const common_1 = require("@nestjs/common");
const in_memory_store_1 = require("../common/in-memory.store");
const wallet_service_1 = require("../wallet/wallet.service");
let VehiclesService = class VehiclesService {
    constructor(store, walletService) {
        this.store = store;
        this.walletService = walletService;
    }
    registerVehicle(payload) {
        const exists = this.store.vehicles.find((v) => v.plate === payload.plate);
        if (exists) {
            throw new common_1.BadRequestException('Vehicle already registered');
        }
        const total = payload.splitRules.reduce((sum, rule) => sum + rule.percentage, 0);
        if (total > 100) {
            throw new common_1.BadRequestException('Split rules cannot exceed 100%');
        }
        const vehicle = this.store.createVehicle(payload.ownerId, payload.plate, payload.saccoId, payload.splitRules);
        this.walletService.ensureVehicleAccounts(vehicle);
        return vehicle;
    }
    listVehicles() {
        return this.store.vehicles;
    }
    findByPlate(plate) {
        return this.store.vehicles.find((v) => v.plate === plate);
    }
};
exports.VehiclesService = VehiclesService;
exports.VehiclesService = VehiclesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [in_memory_store_1.InMemoryStore, wallet_service_1.WalletService])
], VehiclesService);
//# sourceMappingURL=vehicles.service.js.map
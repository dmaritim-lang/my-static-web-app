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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const in_memory_store_1 = require("../common/in-memory.store");
const vehicles_service_1 = require("../vehicles/vehicles.service");
const wallet_service_1 = require("../wallet/wallet.service");
let PaymentsService = class PaymentsService {
    constructor(store, vehiclesService, walletService) {
        this.store = store;
        this.vehiclesService = vehiclesService;
        this.walletService = walletService;
    }
    handleC2B(payload) {
        const exists = this.store.payments.find((p) => p.mpesaReference === payload.transactionId);
        if (exists) {
            throw new common_1.BadRequestException('Duplicate transaction');
        }
        const vehicle = this.vehiclesService.findByPlate(payload.accountReference);
        if (!vehicle) {
            throw new common_1.NotFoundException('Vehicle not found for plate');
        }
        this.store.recordPayment({
            mpesaReference: payload.transactionId,
            vehicleId: vehicle.id,
            passengerPhone: payload.msisdn,
            amount: payload.amount,
        });
        this.walletService.allocateFare(vehicle, payload.amount, payload.transactionId);
        return { status: 'success', vehicleId: vehicle.id };
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [in_memory_store_1.InMemoryStore,
        vehicles_service_1.VehiclesService,
        wallet_service_1.WalletService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map
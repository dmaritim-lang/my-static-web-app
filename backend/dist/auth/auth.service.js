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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const in_memory_store_1 = require("../common/in-memory.store");
let AuthService = class AuthService {
    constructor(store) {
        this.store = store;
    }
    register(payload) {
        const existing = this.store.users.find((u) => u.phone === payload.phone);
        if (existing) {
            throw new common_1.UnauthorizedException('User already exists');
        }
        return this.store.createUser(payload.phone, payload.password, payload.role);
    }
    login(payload) {
        const user = this.store.users.find((u) => u.phone === payload.phone && u.password === payload.password);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const token = Buffer.from(`${user.id}:${user.phone}:${user.role}`).toString('base64');
        return { token, user };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [in_memory_store_1.InMemoryStore])
], AuthService);
//# sourceMappingURL=auth.service.js.map
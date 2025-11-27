import { Injectable, BadRequestException } from '@nestjs/common';
import { InMemoryStore, Vehicle } from '../common/in-memory.store';
import { RegisterVehicleDto } from './dto';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class VehiclesService {
  constructor(private readonly store: InMemoryStore, private readonly walletService: WalletService) {}

  registerVehicle(payload: RegisterVehicleDto): Vehicle {
    const exists = this.store.vehicles.find((v) => v.plate === payload.plate);
    if (exists) {
      throw new BadRequestException('Vehicle already registered');
    }
    const total = payload.splitRules.reduce((sum, rule) => sum + rule.percentage, 0);
    if (total > 100) {
      throw new BadRequestException('Split rules cannot exceed 100%');
    }
    const vehicle = this.store.createVehicle(payload.ownerId, payload.plate, payload.saccoId, payload.splitRules);
    this.walletService.ensureVehicleAccounts(vehicle);
    return vehicle;
  }

  listVehicles() {
    return this.store.vehicles;
  }

  findByPlate(plate: string) {
    return this.store.vehicles.find((v) => v.plate === plate);
  }
}

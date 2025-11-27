import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth/auth.service';
import { VehiclesService } from '../vehicles/vehicles.service';
import { WalletService } from '../wallet/wallet.service';
import { LedgerService } from '../ledger/ledger.service';
import { UssdRequestDto, UssdResponse, UssdSessionState } from './dto';
import { UssdSessionStore } from './session.store';

@Injectable()
export class UssdService {
  constructor(
    private readonly sessions: UssdSessionStore<UssdSessionState>,
    private readonly auth: AuthService,
    private readonly vehicles: VehiclesService,
    private readonly wallet: WalletService,
    private readonly ledger: LedgerService,
  ) {}

  async handle(dto: UssdRequestDto): Promise<string> {
    const userInput = dto.input ?? dto.text ?? '';
    const existing = await this.sessions.get(dto.sessionId);
    const state = existing ?? { flow: 'main', step: 0, data: {} };

    const response = await this.route(state, userInput.trim(), dto.phoneNumber);
    if (response.type === 'END') {
      await this.sessions.clear(dto.sessionId);
    } else {
      await this.sessions.set(dto.sessionId, state, 180);
    }
    return `${response.type} ${response.message}`;
  }

  private async route(state: UssdSessionState, input: string, phone: string): Promise<UssdResponse> {
    if (state.flow === 'main' || state.step === 0) {
      state.flow = 'main';
      state.step = 1;
      state.data = {};
      return {
        type: 'CON',
        message: ['Lipa Fare', '1 Pay fare', '2 Redeem points', '3 Owner balances', '4 Register vehicle'].join('\n'),
      };
    }

    switch (state.flow) {
      case 'fare':
        return this.fareFlow(state, input, phone);
      case 'redeem':
        return this.redeemFlow(state, input, phone);
      case 'owner':
        return this.ownerFlow(state, input);
      case 'register':
        return this.registerFlow(state, input, phone);
      default:
        return this.mainMenu(state, input);
    }
  }

  private mainMenu(state: UssdSessionState, input: string): UssdResponse {
    if (state.flow !== 'main') {
      state.flow = 'main';
      state.step = 1;
    }
    if (state.step === 1) {
      switch (input) {
        case '1':
          state.flow = 'fare';
          state.step = 1;
          return { type: 'CON', message: 'Enter vehicle plate' };
        case '2':
          state.flow = 'redeem';
          state.step = 1;
          return { type: 'CON', message: 'Redeem: enter vehicle plate' };
        case '3':
          state.flow = 'owner';
          state.step = 1;
          return { type: 'CON', message: 'Owner login: phone' };
        case '4':
          state.flow = 'register';
          state.step = 1;
          return { type: 'CON', message: 'Register: owner phone' };
        default:
          return {
            type: 'CON',
            message: ['Pick an option', '1 Pay fare', '2 Redeem points', '3 Owner balances', '4 Register vehicle'].join('\n'),
          };
      }
    }
    return { type: 'CON', message: 'Pick 1-4' };
  }

  private fareFlow(state: UssdSessionState, input: string, phone: string): UssdResponse {
    if (state.step === 1) {
      state.data.plate = input;
      state.step = 2;
      return { type: 'CON', message: 'Enter fare amount' };
    }
    if (state.step === 2) {
      const amount = Number(input);
      if (Number.isNaN(amount) || amount <= 0) {
        return { type: 'CON', message: 'Enter a valid amount' };
      }
      state.data.amount = amount;
      state.step = 3;
      return { type: 'CON', message: `Pay ${amount} to ${state.data.plate}?\n1 Yes\n2 Cancel` };
    }
    if (state.step === 3) {
      if (input !== '1') {
        return { type: 'END', message: 'Cancelled' };
      }
      const vehicle = this.vehicles.findByPlate(state.data.plate);
      if (!vehicle) {
        return { type: 'END', message: 'Vehicle not found' };
      }
      this.wallet.allocateFare(vehicle, state.data.amount, 'FARE-' + Date.now(), phone);
      state.step = 4;
      return { type: 'END', message: 'Payment received. Thank you.' };
    }
    return { type: 'END', message: 'Done' };
  }

  private redeemFlow(state: UssdSessionState, input: string, phone: string): UssdResponse {
    if (state.step === 1) {
      state.data.plate = input;
      state.step = 2;
      return { type: 'CON', message: 'Enter points to redeem as fare' };
    }
    if (state.step === 2) {
      const points = Number(input);
      if (Number.isNaN(points) || points <= 0) {
        return { type: 'CON', message: 'Enter a valid number' };
      }
      state.data.points = points;
      state.step = 3;
      return { type: 'CON', message: `Redeem ${points} pts for ${state.data.plate}?\n1 Yes\n2 Cancel` };
    }
    if (state.step === 3) {
      if (input !== '1') {
        return { type: 'END', message: 'Cancelled' };
      }
      const vehicle = this.vehicles.findByPlate(state.data.plate);
      if (!vehicle) {
        return { type: 'END', message: 'Vehicle not found' };
      }
      this.wallet.redeemWithLoyalty(vehicle, phone, state.data.points, 'REDEEM-' + Date.now());
      state.step = 4;
      return { type: 'END', message: 'Redemption applied. Safe travels!' };
    }
    return { type: 'END', message: 'Done' };
  }

  private ownerFlow(state: UssdSessionState, input: string): UssdResponse {
    if (state.step === 1) {
      state.data.phone = input;
      state.step = 2;
      return { type: 'CON', message: 'Enter password' };
    }
    if (state.step === 2) {
      try {
        const { user } = this.auth.login({ phone: state.data.phone, password: input });
        const balances = this.wallet.balancesForOwner(user.id).slice(0, 4);
        const lines = balances.map((b) => `${b.type}: ${b.balance}`);
        return { type: 'END', message: ['Balances', ...lines].join('\n') };
      } catch (e) {
        return { type: 'END', message: 'Login failed' };
      }
    }
    return { type: 'END', message: 'Done' };
  }

  private registerFlow(state: UssdSessionState, input: string, phone: string): UssdResponse {
    if (state.step === 1) {
      state.data.ownerPhone = input || phone;
      state.step = 2;
      return { type: 'CON', message: 'Vehicle plate' };
    }
    if (state.step === 2) {
      state.data.plate = input.toUpperCase();
      state.step = 3;
      return { type: 'CON', message: 'SACCO ID (optional, blank to skip)' };
    }
    if (state.step === 3) {
      state.data.saccoId = input || undefined;
      // Ensure owner exists or create
      let owner = this.auth.findByPhone(state.data.ownerPhone);
      if (!owner) {
        owner = this.auth.register({ phone: state.data.ownerPhone, password: '0000', role: 'owner' });
      }
      try {
        this.vehicles.registerVehicle({
          ownerId: owner.id,
          plate: state.data.plate,
          saccoId: state.data.saccoId,
          splitRules: [
            { label: 'Platform', percentage: 5, accountType: 'platform_commission' },
            { label: 'Fuel', percentage: 10, accountType: 'fuel' },
          ],
        });
        return { type: 'END', message: 'Vehicle registered' };
      } catch (error: any) {
        return { type: 'END', message: error.message || 'Error registering' };
      }
    }
    return { type: 'END', message: 'Done' };
  }
}

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InMemoryStore } from '../common/in-memory.store';
import { MpesaB2BDto, MpesaB2CDto, MpesaC2BDto, MpesaC2BValidationDto } from './dto';
import { VehiclesService } from '../vehicles/vehicles.service';
import { WalletService } from '../wallet/wallet.service';
import { MpesaService } from './mpesa.service';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly store: InMemoryStore,
    private readonly vehiclesService: VehiclesService,
    private readonly walletService: WalletService,
    private readonly mpesaService: MpesaService,
  ) {}

  handleC2B(payload: MpesaC2BDto) {
    const exists = this.store.payments.find((p) => p.mpesaReference === payload.transactionId);
    if (exists) {
      throw new BadRequestException('Duplicate transaction');
    }
    const vehicle = this.vehiclesService.findByPlate(payload.accountReference);
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found for plate');
    }

    this.store.recordPayment({
      mpesaReference: payload.transactionId,
      vehicleId: vehicle.id,
      passengerPhone: payload.msisdn,
      amount: payload.amount,
      direction: 'c2b',
      status: 'successful',
      metadata: { channel: 'paybill' },
    });

    this.walletService.allocateFare(vehicle, payload.amount, payload.transactionId, payload.msisdn);

    return { status: 'success', vehicleId: vehicle.id };
  }

  handleC2BValidation(payload: MpesaC2BValidationDto) {
    if (payload.TransAmount <= 0) {
      return { ResultCode: 1, ResultDesc: 'Amount must be positive' };
    }

    const duplicate = this.store.payments.find((p) => p.mpesaReference === payload.TransID);
    if (duplicate) {
      return { ResultCode: 1, ResultDesc: 'Duplicate transaction' };
    }

    const vehicle = this.vehiclesService.findByPlate(payload.BillRefNumber);
    if (!vehicle) {
      return { ResultCode: 1, ResultDesc: 'Unknown vehicle plate' };
    }

    return { ResultCode: 0, ResultDesc: 'Accepted' };
  }

  handleC2BConfirmation(payload: MpesaC2BValidationDto) {
    const vehicle = this.vehiclesService.findByPlate(payload.BillRefNumber);
    if (!vehicle) {
      throw new NotFoundException('Vehicle not found for plate');
    }

    const exists = this.store.payments.find((p) => p.mpesaReference === payload.TransID);
    if (exists) {
      throw new BadRequestException('Duplicate transaction');
    }

    this.store.recordPayment({
      mpesaReference: payload.TransID,
      vehicleId: vehicle.id,
      passengerPhone: payload.MSISDN,
      amount: payload.TransAmount,
      direction: 'c2b',
      status: 'successful',
      metadata: { channel: 'paybill', transTime: payload.TransTime },
    });

    this.walletService.allocateFare(vehicle, payload.TransAmount, payload.TransID, payload.MSISDN);

    return { ResultCode: 0, ResultDesc: 'Confirmation received' };
  }

  async handleB2C(payload: MpesaB2CDto) {
    if (payload.amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const response = await this.mpesaService.sendB2C({
      amount: payload.amount,
      msisdn: payload.msisdn,
      reference: payload.reference,
    });

    const accepted = !response?.errorCode && (response?.ResponseCode === '0' || !!response?.message);

    if (accepted) {
      this.walletService.payOut(
        payload.ownerId,
        payload.amount,
        payload.reference,
        `B2C withdrawal to ${payload.msisdn}`,
        'mpesa_b2c_pool',
      );
    }

    this.store.recordPayment({
      mpesaReference: payload.reference,
      amount: payload.amount,
      direction: 'b2c',
      status: accepted ? 'successful' : 'failed',
      metadata: { msisdn: payload.msisdn, response: JSON.stringify(response) },
    });

    return { status: accepted ? 'success' : 'failed', mpesa: response };
  }

  async handleB2B(payload: MpesaB2BDto) {
    if (payload.amount <= 0) {
      throw new BadRequestException('Amount must be positive');
    }

    const response = await this.mpesaService.sendB2B({
      amount: payload.amount,
      accountReference: payload.accountReference,
      destinationShortcode: payload.destinationShortcode,
      reference: payload.reference,
    });

    const accepted = !response?.errorCode && (response?.ResponseCode === '0' || !!response?.message);

    if (accepted) {
      this.walletService.payOut(
        payload.ownerId,
        payload.amount,
        payload.reference,
        `B2B payment to ${payload.destinationShortcode}`,
        'mpesa_b2b_pool',
      );
    }

    this.store.recordPayment({
      mpesaReference: payload.reference,
      amount: payload.amount,
      direction: 'b2b',
      status: accepted ? 'successful' : 'failed',
      metadata: { destination: payload.destinationShortcode, response: JSON.stringify(response) },
    });

    return { status: accepted ? 'success' : 'failed', mpesa: response };
  }
}

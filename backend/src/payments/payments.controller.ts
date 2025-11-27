import { Body, Controller, Post } from '@nestjs/common';
import { MpesaB2BDto, MpesaB2CDto, MpesaC2BDto, MpesaC2BValidationDto } from './dto';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('mpesa/c2b')
  handleC2B(@Body() payload: MpesaC2BDto) {
    return this.paymentsService.handleC2B(payload);
  }

  @Post('mpesa/c2b/validation')
  validateC2B(@Body() payload: MpesaC2BValidationDto) {
    return this.paymentsService.handleC2BValidation(payload);
  }

  @Post('mpesa/c2b/confirmation')
  confirmC2B(@Body() payload: MpesaC2BValidationDto) {
    return this.paymentsService.handleC2BConfirmation(payload);
  }

  @Post('mpesa/b2c')
  async payoutB2C(@Body() payload: MpesaB2CDto) {
    return this.paymentsService.handleB2C(payload);
  }

  @Post('mpesa/b2b')
  async payoutB2B(@Body() payload: MpesaB2BDto) {
    return this.paymentsService.handleB2B(payload);
  }
}

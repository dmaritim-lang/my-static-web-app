import { Module, forwardRef } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { WalletModule } from '../wallet/wallet.module';
import { MpesaService } from './mpesa.service';

@Module({
  imports: [forwardRef(() => VehiclesModule), forwardRef(() => WalletModule)],
  controllers: [PaymentsController],
  providers: [PaymentsService, MpesaService],
})
export class PaymentsModule {}

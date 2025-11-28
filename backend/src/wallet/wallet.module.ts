import { Module, forwardRef } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { LedgerModule } from '../ledger/ledger.module';
import { VehiclesModule } from '../vehicles/vehicles.module';

@Module({
  imports: [LedgerModule, forwardRef(() => VehiclesModule)],
  providers: [WalletService],
  controllers: [WalletController],
  exports: [WalletService],
})
export class WalletModule {}

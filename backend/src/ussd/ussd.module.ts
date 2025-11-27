import { Module } from '@nestjs/common';
import { UssdController } from './ussd.controller';
import { UssdService } from './ussd.service';
import { UssdSessionStore } from './session.store';
import { AuthModule } from '../auth/auth.module';
import { VehiclesModule } from '../vehicles/vehicles.module';
import { WalletModule } from '../wallet/wallet.module';
import { LedgerModule } from '../ledger/ledger.module';

@Module({
  imports: [AuthModule, VehiclesModule, WalletModule, LedgerModule],
  controllers: [UssdController],
  providers: [UssdService, UssdSessionStore],
})
export class UssdModule {}

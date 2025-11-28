import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { VehiclesModule } from './vehicles/vehicles.module';
import { WalletModule } from './wallet/wallet.module';
import { PaymentsModule } from './payments/payments.module';
import { LedgerModule } from './ledger/ledger.module';
import { CommonModule } from './common/common.module';
import { UssdModule } from './ussd/ussd.module';

@Module({
  imports: [CommonModule, AuthModule, VehiclesModule, WalletModule, PaymentsModule, LedgerModule, UssdModule],
})
export class AppModule {}

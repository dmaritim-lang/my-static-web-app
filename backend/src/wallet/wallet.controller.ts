import { Controller, Get, Param } from '@nestjs/common';
import { WalletService } from './wallet.service';

@Controller('wallets')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get(':ownerId')
  balances(@Param('ownerId') ownerId: string) {
    return this.walletService.balancesForOwner(ownerId);
  }
}

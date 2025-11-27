import { Body, Controller, Post } from '@nestjs/common';
import { UssdService } from './ussd.service';
import { UssdRequestDto } from './dto';

@Controller('ussd')
export class UssdController {
  constructor(private readonly ussd: UssdService) {}

  @Post()
  async handle(@Body() dto: UssdRequestDto) {
    return this.ussd.handle(dto);
  }
}

import { Body, Controller, Get, Post } from '@nestjs/common';
import { RegisterVehicleDto } from './dto';
import { VehiclesService } from './vehicles.service';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Post()
  register(@Body() payload: RegisterVehicleDto) {
    return this.vehiclesService.registerVehicle(payload);
  }

  @Get()
  list() {
    return this.vehiclesService.listVehicles();
  }
}

import { Module } from '@nestjs/common';
import { FuelTanksService } from './fuel-tanks.service';
import { FuelTanksController } from './fuel-tanks.controller';
import { FuelDeliveriesService } from './fuel-deliveries.service';
import { FuelDeliveriesController } from './fuel-deliveries.controller';

@Module({
  controllers: [FuelTanksController, FuelDeliveriesController],
  providers: [FuelTanksService, FuelDeliveriesService],
  exports: [FuelTanksService, FuelDeliveriesService],
})
export class FuelModule {}

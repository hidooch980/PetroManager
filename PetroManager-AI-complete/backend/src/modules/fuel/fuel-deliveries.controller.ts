import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { FuelDeliveriesService } from './fuel-deliveries.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class CreateDeliveryDto {
  @IsString()
  tankId: string;

  @IsOptional()
  @IsString()
  supplierName?: string;

  @IsNumber()
  @Min(0.01)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitCost: number;

  @IsOptional()
  @IsString()
  invoiceNo?: string;
}

@UseGuards(JwtAuthGuard)
@Controller('fuel-deliveries')
export class FuelDeliveriesController {
  constructor(private readonly deliveriesService: FuelDeliveriesService) {}

  @Post()
  create(@Body() dto: CreateDeliveryDto) {
    return this.deliveriesService.create(dto);
  }

  @Get()
  findAll(@Query('tankId') tankId?: string) {
    return this.deliveriesService.findAll(tankId);
  }
}

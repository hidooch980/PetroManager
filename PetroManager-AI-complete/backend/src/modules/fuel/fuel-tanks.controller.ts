import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { FuelType } from '@prisma/client';
import { FuelTanksService } from './fuel-tanks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class CreateTankDto {
  @IsString()
  stationId: string;

  @IsEnum(FuelType)
  fuelType: FuelType;

  @IsNumber()
  @Min(0)
  capacity: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  currentLevel?: number;
}

@UseGuards(JwtAuthGuard)
@Controller('fuel-tanks')
export class FuelTanksController {
  constructor(private readonly tanksService: FuelTanksService) {}

  @Post()
  create(@Body() dto: CreateTankDto) {
    return this.tanksService.create(dto);
  }

  @Get()
  findAll(@Query('stationId') stationId?: string) {
    return this.tanksService.findAll(stationId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tanksService.findOne(id);
  }
}

import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { IsInt, IsString, Max, Min } from 'class-validator';
import { InsuranceService } from './insurance.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class GenerateInsuranceDto {
  @IsString()
  employeeId: string;

  @IsInt()
  @Min(1)
  @Max(12)
  periodMonth: number;

  @IsInt()
  @Min(2000)
  periodYear: number;
}

@UseGuards(JwtAuthGuard)
@Controller('insurance')
export class InsuranceController {
  constructor(private readonly insuranceService: InsuranceService) {}

  @Post()
  generate(@Body() dto: GenerateInsuranceDto) {
    return this.insuranceService.generate(dto);
  }

  @Get('by-employee/:employeeId')
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.insuranceService.findByEmployee(employeeId);
  }
}

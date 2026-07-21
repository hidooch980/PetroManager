import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { IsInt, IsString, Max, Min } from 'class-validator';
import { TaxService } from './tax.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class GenerateTaxDto {
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
@Controller('tax')
export class TaxController {
  constructor(private readonly taxService: TaxService) {}

  @Post()
  generate(@Body() dto: GenerateTaxDto) {
    return this.taxService.generate(dto);
  }

  @Get('by-employee/:employeeId')
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.taxService.findByEmployee(employeeId);
  }
}

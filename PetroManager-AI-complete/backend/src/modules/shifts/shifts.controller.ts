import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { IsNumber, IsString, Min } from 'class-validator';
import { ShiftsService } from './shifts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class OpenShiftDto {
  @IsString()
  employeeId: string;

  @IsNumber()
  @Min(0)
  openingCash: number;
}

class CloseShiftDto {
  @IsNumber()
  @Min(0)
  closingCash: number;
}

@UseGuards(JwtAuthGuard)
@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Post('open')
  open(@Body() dto: OpenShiftDto) {
    return this.shiftsService.open(dto.employeeId, dto.openingCash);
  }

  @Post(':id/close')
  close(@Param('id') id: string, @Body() dto: CloseShiftDto) {
    return this.shiftsService.close(id, dto.closingCash);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shiftsService.findOne(id);
  }
}

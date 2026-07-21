import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { EmployeesService } from './employees.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

class CreateEmployeeDto {
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  nationalId?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  baseSalary?: number;
}

@UseGuards(JwtAuthGuard)
@Controller('employees')
export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  create(@Body() dto: CreateEmployeeDto) {
    return this.employeesService.create(dto);
  }

  @Get()
  findAll() {
    return this.employeesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id);
  }

  @Post(':id/check-in')
  checkIn(@Param('id') id: string, @Body('note') note?: string) {
    return this.employeesService.checkIn(id, note);
  }

  @Post('attendance/:attendanceId/check-out')
  checkOut(@Param('attendanceId') attendanceId: string) {
    return this.employeesService.checkOut(attendanceId);
  }

  @Get(':id/attendance')
  attendance(@Param('id') id: string) {
    return this.employeesService.findAttendanceByEmployee(id);
  }
}

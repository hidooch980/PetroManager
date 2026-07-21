import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

function parseDateOrToday(value?: string) {
  return value ? new Date(value) : new Date();
}

function parseRange(from?: string, to?: string) {
  const fromDate = from ? new Date(from) : new Date(new Date().setDate(1));
  const toDate = to ? new Date(to) : new Date();
  return { fromDate, toDate };
}

@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('sales/daily')
  dailySales(@Query('date') date?: string) {
    return this.reportsService.dailySales(parseDateOrToday(date));
  }

  @Get('sales/monthly')
  monthlySales(@Query('month') month: string, @Query('year') year: string) {
    return this.reportsService.monthlySales(Number(month), Number(year));
  }

  @Get('fuel/inventory')
  fuelInventory() {
    return this.reportsService.fuelInventory();
  }

  @Get('expenses')
  expenses(@Query('from') from?: string, @Query('to') to?: string) {
    const { fromDate, toDate } = parseRange(from, to);
    return this.reportsService.expenses(fromDate, toDate);
  }

  @Get('profit-loss')
  profitAndLoss(@Query('from') from?: string, @Query('to') to?: string) {
    const { fromDate, toDate } = parseRange(from, to);
    return this.reportsService.profitAndLoss(fromDate, toDate);
  }

  @Get('employees/performance')
  employeePerformance(@Query('from') from?: string, @Query('to') to?: string) {
    const { fromDate, toDate } = parseRange(from, to);
    return this.reportsService.employeePerformance(fromDate, toDate);
  }

  @Get('shifts')
  shifts(@Query('from') from?: string, @Query('to') to?: string) {
    const { fromDate, toDate } = parseRange(from, to);
    return this.reportsService.shiftsReport(fromDate, toDate);
  }
}

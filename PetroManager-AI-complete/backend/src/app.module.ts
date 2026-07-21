import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { StationsModule } from './modules/stations/stations.module';
import { EmployeesModule } from './modules/employees/employees.module';
import { ShiftsModule } from './modules/shifts/shifts.module';
import { FuelModule } from './modules/fuel/fuel.module';
import { SalesModule } from './modules/sales/sales.module';
import { ExpensesModule } from './modules/expenses/expenses.module';
import { PayrollModule } from './modules/payroll/payroll.module';
import { InsuranceModule } from './modules/insurance/insurance.module';
import { TaxModule } from './modules/tax/tax.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    StationsModule,
    EmployeesModule,
    ShiftsModule,
    FuelModule,
    SalesModule,
    ExpensesModule,
    PayrollModule,
    InsuranceModule,
    TaxModule,
    ReportsModule,
  ],
})
export class AppModule {}

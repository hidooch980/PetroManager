import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

interface GeneratePayrollInput {
  employeeId: string;
  periodMonth: number;
  periodYear: number;
  bonuses?: number;
  deductions?: number;
}

@Injectable()
export class PayrollService {
  constructor(private readonly prisma: PrismaService) {}

  async generate(input: GeneratePayrollInput) {
    const employee = await this.prisma.employee.findUnique({ where: { id: input.employeeId } });
    if (!employee) throw new NotFoundException('کارمند پیدا نشد');
    if (!employee.baseSalary) {
      throw new BadRequestException('حقوق پایه برای این کارمند ثبت نشده است');
    }

    const existing = await this.prisma.payroll.findUnique({
      where: {
        employeeId_periodMonth_periodYear: {
          employeeId: input.employeeId,
          periodMonth: input.periodMonth,
          periodYear: input.periodYear,
        },
      },
    });
    if (existing) {
      throw new BadRequestException('فیش حقوقی این ماه قبلاً ساخته شده است');
    }

    const bonuses = input.bonuses ?? 0;
    const deductions = input.deductions ?? 0;
    const baseAmount = Number(employee.baseSalary);
    const netAmount = baseAmount + bonuses - deductions;

    return this.prisma.payroll.create({
      data: {
        employeeId: input.employeeId,
        periodMonth: input.periodMonth,
        periodYear: input.periodYear,
        baseAmount,
        bonuses,
        deductions,
        netAmount,
      },
    });
  }

  async markPaid(id: string) {
    const payroll = await this.prisma.payroll.findUnique({ where: { id } });
    if (!payroll) throw new NotFoundException('فیش حقوقی پیدا نشد');
    return this.prisma.payroll.update({ where: { id }, data: { paidAt: new Date() } });
  }

  findByEmployee(employeeId: string) {
    return this.prisma.payroll.findMany({
      where: { employeeId },
      orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
    });
  }

  findByPeriod(periodMonth: number, periodYear: number) {
    return this.prisma.payroll.findMany({
      where: { periodMonth, periodYear },
      include: { employee: { select: { fullName: true } } },
    });
  }
}

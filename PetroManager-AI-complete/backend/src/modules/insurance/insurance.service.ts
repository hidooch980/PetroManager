import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

// نرخ‌ها قابل تنظیم از طریق متغیر محیطی هستند (نرخ رسمی بیمه ایران به‌صورت پیش‌فرض تقریبی است،
// حتماً قبل از استفاده واقعی با نرخ رسمی سازمان تأمین اجتماعی مطابقت داده شود)
const EMPLOYEE_SHARE_RATE = Number(process.env.INSURANCE_EMPLOYEE_RATE ?? 0.07);
const EMPLOYER_SHARE_RATE = Number(process.env.INSURANCE_EMPLOYER_RATE ?? 0.23);

interface GenerateInsuranceInput {
  employeeId: string;
  periodMonth: number;
  periodYear: number;
}

@Injectable()
export class InsuranceService {
  constructor(private readonly prisma: PrismaService) {}

  async generate(input: GenerateInsuranceInput) {
    const employee = await this.prisma.employee.findUnique({ where: { id: input.employeeId } });
    if (!employee) throw new NotFoundException('کارمند پیدا نشد');
    if (!employee.baseSalary) {
      throw new BadRequestException('حقوق پایه برای این کارمند ثبت نشده است');
    }

    const existing = await this.prisma.insuranceRecord.findUnique({
      where: {
        employeeId_periodMonth_periodYear: {
          employeeId: input.employeeId,
          periodMonth: input.periodMonth,
          periodYear: input.periodYear,
        },
      },
    });
    if (existing) {
      throw new BadRequestException('رکورد بیمه این ماه قبلاً ساخته شده است');
    }

    const baseAmount = Number(employee.baseSalary);
    const employeeShare = baseAmount * EMPLOYEE_SHARE_RATE;
    const employerShare = baseAmount * EMPLOYER_SHARE_RATE;

    return this.prisma.insuranceRecord.create({
      data: {
        employeeId: input.employeeId,
        periodMonth: input.periodMonth,
        periodYear: input.periodYear,
        baseAmount,
        employeeShare,
        employerShare,
        totalAmount: employeeShare + employerShare,
      },
    });
  }

  findByEmployee(employeeId: string) {
    return this.prisma.insuranceRecord.findMany({
      where: { employeeId },
      orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
    });
  }
}

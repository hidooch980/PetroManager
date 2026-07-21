import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

// نرخ مالیات ساده و قابل تنظیم؛ برای محاسبه دقیق مطابق قانون مالیات‌های مستقیم،
// این سرویس باید با جدول پلکانی رسمی جایگزین شود.
const TAX_RATE = Number(process.env.TAX_RATE ?? 0.1);
const TAX_EXEMPTION_THRESHOLD = Number(process.env.TAX_EXEMPTION_THRESHOLD ?? 0);

interface GenerateTaxInput {
  employeeId: string;
  periodMonth: number;
  periodYear: number;
}

@Injectable()
export class TaxService {
  constructor(private readonly prisma: PrismaService) {}

  async generate(input: GenerateTaxInput) {
    const employee = await this.prisma.employee.findUnique({ where: { id: input.employeeId } });
    if (!employee) throw new NotFoundException('کارمند پیدا نشد');
    if (!employee.baseSalary) {
      throw new BadRequestException('حقوق پایه برای این کارمند ثبت نشده است');
    }

    const existing = await this.prisma.taxRecord.findUnique({
      where: {
        employeeId_periodMonth_periodYear: {
          employeeId: input.employeeId,
          periodMonth: input.periodMonth,
          periodYear: input.periodYear,
        },
      },
    });
    if (existing) {
      throw new BadRequestException('رکورد مالیات این ماه قبلاً ساخته شده است');
    }

    const baseAmount = Number(employee.baseSalary);
    const taxableAmount = Math.max(0, baseAmount - TAX_EXEMPTION_THRESHOLD);
    const taxAmount = taxableAmount * TAX_RATE;

    return this.prisma.taxRecord.create({
      data: {
        employeeId: input.employeeId,
        periodMonth: input.periodMonth,
        periodYear: input.periodYear,
        taxableAmount,
        taxAmount,
      },
    });
  }

  findByEmployee(employeeId: string) {
    return this.prisma.taxRecord.findMany({
      where: { employeeId },
      orderBy: [{ periodYear: 'desc' }, { periodMonth: 'desc' }],
    });
  }
}

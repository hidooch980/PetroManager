import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ShiftStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

// نسخه پایه — ثبت حضور و غیاب و تحویل کامل شیفت در مرحله ۳ اضافه می‌شود.
// این سرویس فقط برای اینکه Sales و Expenses بتوانند به یک شیفت متصل شوند لازم است.

@Injectable()
export class ShiftsService {
  constructor(private readonly prisma: PrismaService) {}

  async open(employeeId: string, openingCash: number) {
    const openShift = await this.prisma.shift.findFirst({
      where: { employeeId, status: ShiftStatus.OPEN },
    });
    if (openShift) {
      throw new BadRequestException('این کارمند در حال حاضر یک شیفت باز دارد');
    }

    return this.prisma.shift.create({
      data: {
        employeeId,
        startedAt: new Date(),
        openingCash,
        status: ShiftStatus.OPEN,
      },
    });
  }

  async close(id: string, closingCash: number) {
    const shift = await this.prisma.shift.findUnique({
      where: { id },
      include: { sales: true, expenses: true },
    });
    if (!shift) throw new NotFoundException('شیفت پیدا نشد');
    if (shift.status === ShiftStatus.CLOSED) {
      throw new BadRequestException('این شیفت قبلاً بسته شده است');
    }

    const totalSales = shift.sales.reduce((sum, s) => sum + Number(s.totalAmount), 0);
    const totalExpenses = shift.expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const expectedCash = Number(shift.openingCash) + totalSales - totalExpenses;
    const cashDifference = closingCash - expectedCash;

    return this.prisma.shift.update({
      where: { id },
      data: {
        endedAt: new Date(),
        status: ShiftStatus.CLOSED,
        closingCash,
        cashDifference,
      },
    });
  }

  findOpenByEmployee(employeeId: string) {
    return this.prisma.shift.findFirst({
      where: { employeeId, status: ShiftStatus.OPEN },
    });
  }

  async findOne(id: string) {
    const shift = await this.prisma.shift.findUnique({
      where: { id },
      include: { sales: true, expenses: true },
    });
    if (!shift) throw new NotFoundException('شیفت پیدا نشد');
    return shift;
  }
}

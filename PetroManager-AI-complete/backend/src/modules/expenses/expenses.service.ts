import { Injectable } from '@nestjs/common';
import { ExpenseCategory } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

interface CreateExpenseInput {
  shiftId?: string;
  category: ExpenseCategory;
  amount: number;
  description?: string;
}

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateExpenseInput) {
    return this.prisma.expense.create({ data: input });
  }

  findByShift(shiftId: string) {
    return this.prisma.expense.findMany({
      where: { shiftId },
      orderBy: { paidAt: 'desc' },
    });
  }

  findByDateRange(from: Date, to: Date) {
    return this.prisma.expense.findMany({
      where: { paidAt: { gte: from, lte: to } },
      orderBy: { paidAt: 'desc' },
    });
  }
}

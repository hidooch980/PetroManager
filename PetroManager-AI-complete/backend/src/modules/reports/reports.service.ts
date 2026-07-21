import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}
function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  // گزارش فروش روزانه
  async dailySales(date: Date) {
    const from = startOfDay(date);
    const to = endOfDay(date);

    const sales = await this.prisma.sale.findMany({
      where: { soldAt: { gte: from, lte: to } },
    });

    const totalAmount = sales.reduce((sum, s) => sum + Number(s.totalAmount), 0);
    const byFuelType: Record<string, number> = {};
    for (const sale of sales) {
      const key = sale.fuelType ?? 'OTHER';
      byFuelType[key] = (byFuelType[key] ?? 0) + Number(sale.totalAmount);
    }

    return { date: from, totalAmount, count: sales.length, byFuelType };
  }

  // گزارش فروش ماهانه
  async monthlySales(month: number, year: number) {
    const from = new Date(year, month - 1, 1);
    const to = new Date(year, month, 0, 23, 59, 59, 999);

    const sales = await this.prisma.sale.findMany({
      where: { soldAt: { gte: from, lte: to } },
    });

    const totalAmount = sales.reduce((sum, s) => sum + Number(s.totalAmount), 0);
    const byFuelType: Record<string, number> = {};
    for (const sale of sales) {
      const key = sale.fuelType ?? 'OTHER';
      byFuelType[key] = (byFuelType[key] ?? 0) + Number(sale.totalAmount);
    }

    return { month, year, totalAmount, count: sales.length, byFuelType };
  }

  // گزارش مصرف و موجودی سوخت
  async fuelInventory() {
    const tanks = await this.prisma.fuelTank.findMany({
      include: {
        _count: { select: { sales: true, deliveries: true } },
      },
    });

    return tanks.map((tank) => ({
      id: tank.id,
      fuelType: tank.fuelType,
      capacity: Number(tank.capacity),
      currentLevel: Number(tank.currentLevel),
      fillRatio: Number(tank.capacity) > 0 ? Number(tank.currentLevel) / Number(tank.capacity) : 0,
      totalSalesCount: tank._count.sales,
      totalDeliveriesCount: tank._count.deliveries,
    }));
  }

  // گزارش هزینه‌ها
  async expenses(from: Date, to: Date) {
    const expenses = await this.prisma.expense.findMany({
      where: { paidAt: { gte: from, lte: to } },
    });

    const totalAmount = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const byCategory: Record<string, number> = {};
    for (const expense of expenses) {
      byCategory[expense.category] = (byCategory[expense.category] ?? 0) + Number(expense.amount);
    }

    return { from, to, totalAmount, count: expenses.length, byCategory };
  }

  // سود و زیان
  async profitAndLoss(from: Date, to: Date) {
    const [sales, expenses, deliveries] = await Promise.all([
      this.prisma.sale.findMany({ where: { soldAt: { gte: from, lte: to } } }),
      this.prisma.expense.findMany({ where: { paidAt: { gte: from, lte: to } } }),
      this.prisma.fuelDelivery.findMany({ where: { deliveredAt: { gte: from, lte: to } } }),
    ]);

    const totalRevenue = sales.reduce((sum, s) => sum + Number(s.totalAmount), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    const totalFuelCost = deliveries.reduce((sum, d) => sum + Number(d.totalCost), 0);
    const netProfit = totalRevenue - totalExpenses - totalFuelCost;

    return { from, to, totalRevenue, totalExpenses, totalFuelCost, netProfit };
  }

  // گزارش عملکرد کارکنان
  async employeePerformance(from: Date, to: Date) {
    const shifts = await this.prisma.shift.findMany({
      where: { startedAt: { gte: from, lte: to } },
      include: {
        employee: { select: { id: true, fullName: true } },
        sales: true,
        expenses: true,
      },
    });

    const byEmployee: Record<string, { employeeId: string; fullName: string; totalSales: number; shiftCount: number; totalCashDifference: number }> = {};

    for (const shift of shifts) {
      const key = shift.employeeId;
      if (!byEmployee[key]) {
        byEmployee[key] = {
          employeeId: shift.employeeId,
          fullName: shift.employee.fullName,
          totalSales: 0,
          shiftCount: 0,
          totalCashDifference: 0,
        };
      }
      byEmployee[key].totalSales += shift.sales.reduce((sum, s) => sum + Number(s.totalAmount), 0);
      byEmployee[key].shiftCount += 1;
      byEmployee[key].totalCashDifference += shift.cashDifference ? Number(shift.cashDifference) : 0;
    }

    return Object.values(byEmployee);
  }

  // گزارش شیفت‌ها
  async shiftsReport(from: Date, to: Date) {
    const shifts = await this.prisma.shift.findMany({
      where: { startedAt: { gte: from, lte: to } },
      include: {
        employee: { select: { fullName: true } },
        sales: true,
        expenses: true,
      },
      orderBy: { startedAt: 'desc' },
    });

    return shifts.map((shift) => ({
      id: shift.id,
      employeeName: shift.employee.fullName,
      startedAt: shift.startedAt,
      endedAt: shift.endedAt,
      status: shift.status,
      openingCash: Number(shift.openingCash),
      closingCash: shift.closingCash ? Number(shift.closingCash) : null,
      cashDifference: shift.cashDifference ? Number(shift.cashDifference) : null,
      totalSales: shift.sales.reduce((sum, s) => sum + Number(s.totalAmount), 0),
      totalExpenses: shift.expenses.reduce((sum, e) => sum + Number(e.amount), 0),
    }));
  }
}

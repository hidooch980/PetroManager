import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { FuelType, ShiftStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

interface CreateSaleInput {
  shiftId: string;
  tankId?: string;
  fuelType?: FuelType;
  quantity?: number;
  unitPrice: number;
  description?: string;
  paymentMethod?: string;
}

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateSaleInput) {
    const shift = await this.prisma.shift.findUnique({ where: { id: input.shiftId } });
    if (!shift) throw new NotFoundException('شیفت پیدا نشد');
    if (shift.status !== ShiftStatus.OPEN) {
      throw new BadRequestException('فروش فقط برای شیفت باز قابل ثبت است');
    }

    const isFuelSale = !!input.tankId;
    if (isFuelSale && !input.quantity) {
      throw new BadRequestException('برای فروش سوخت، مقدار (quantity) الزامی است');
    }

    const totalAmount = isFuelSale
      ? Number(input.quantity) * input.unitPrice
      : input.unitPrice;

    return this.prisma.$transaction(async (tx) => {
      if (isFuelSale) {
        const tank = await tx.fuelTank.findUnique({ where: { id: input.tankId } });
        if (!tank) throw new NotFoundException('مخزن پیدا نشد');
        if (Number(tank.currentLevel) < Number(input.quantity)) {
          throw new BadRequestException('موجودی مخزن برای این فروش کافی نیست');
        }

        await tx.fuelTank.update({
          where: { id: input.tankId },
          data: { currentLevel: { decrement: input.quantity } },
        });
      }

      return tx.sale.create({
        data: {
          shiftId: input.shiftId,
          tankId: input.tankId,
          fuelType: input.fuelType,
          quantity: input.quantity,
          unitPrice: input.unitPrice,
          totalAmount,
          description: input.description,
          paymentMethod: input.paymentMethod,
        },
      });
    });
  }

  findByShift(shiftId: string) {
    return this.prisma.sale.findMany({
      where: { shiftId },
      orderBy: { soldAt: 'desc' },
    });
  }

  findByDateRange(from: Date, to: Date) {
    return this.prisma.sale.findMany({
      where: { soldAt: { gte: from, lte: to } },
      orderBy: { soldAt: 'desc' },
    });
  }
}

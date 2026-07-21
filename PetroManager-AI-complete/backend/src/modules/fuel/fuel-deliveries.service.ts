import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

interface CreateDeliveryInput {
  tankId: string;
  supplierName?: string;
  quantity: number;
  unitCost: number;
  invoiceNo?: string;
  deliveredAt?: Date;
}

@Injectable()
export class FuelDeliveriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateDeliveryInput) {
    const tank = await this.prisma.fuelTank.findUnique({ where: { id: input.tankId } });
    if (!tank) throw new NotFoundException('مخزن پیدا نشد');

    const totalCost = input.quantity * input.unitCost;

    return this.prisma.$transaction(async (tx) => {
      const delivery = await tx.fuelDelivery.create({
        data: {
          tankId: input.tankId,
          supplierName: input.supplierName,
          quantity: input.quantity,
          unitCost: input.unitCost,
          totalCost,
          invoiceNo: input.invoiceNo,
          deliveredAt: input.deliveredAt ?? new Date(),
        },
      });

      await tx.fuelTank.update({
        where: { id: input.tankId },
        data: { currentLevel: { increment: input.quantity } },
      });

      return delivery;
    });
  }

  findAll(tankId?: string) {
    return this.prisma.fuelDelivery.findMany({
      where: tankId ? { tankId } : undefined,
      orderBy: { deliveredAt: 'desc' },
    });
  }
}

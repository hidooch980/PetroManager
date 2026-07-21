import { Injectable, NotFoundException } from '@nestjs/common';
import { FuelType } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';

interface CreateTankInput {
  stationId: string;
  fuelType: FuelType;
  capacity: number;
  currentLevel?: number;
}

@Injectable()
export class FuelTanksService {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateTankInput) {
    return this.prisma.fuelTank.create({
      data: {
        stationId: input.stationId,
        fuelType: input.fuelType,
        capacity: input.capacity,
        currentLevel: input.currentLevel ?? 0,
      },
    });
  }

  findAll(stationId?: string) {
    return this.prisma.fuelTank.findMany({
      where: stationId ? { stationId } : undefined,
    });
  }

  async findOne(id: string) {
    const tank = await this.prisma.fuelTank.findUnique({ where: { id } });
    if (!tank) throw new NotFoundException('مخزن پیدا نشد');
    return tank;
  }

  /**
   * افزایش یا کاهش مستقیم سطح مخزن (برای تحویل سوخت یا اصلاح دستی).
   * برای کسر موجودی هنگام فروش، از SalesService استفاده می‌شود که
   * این متد را در همان تراکنش فراخوانی می‌کند.
   */
  async adjustLevel(id: string, delta: number) {
    const tank = await this.findOne(id);
    const newLevel = Number(tank.currentLevel) + delta;
    if (newLevel < 0) {
      throw new NotFoundException('موجودی مخزن کافی نیست');
    }
    return this.prisma.fuelTank.update({
      where: { id },
      data: { currentLevel: newLevel },
    });
  }
}

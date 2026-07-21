import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

interface UpsertStationInput {
  name: string;
  address?: string;
  phone?: string;
  licenseNo?: string;
}

@Injectable()
export class StationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: UpsertStationInput) {
    return this.prisma.station.create({ data: input });
  }

  async findAll() {
    return this.prisma.station.findMany();
  }

  async findOne(id: string) {
    const station = await this.prisma.station.findUnique({ where: { id } });
    if (!station) throw new NotFoundException('جایگاه پیدا نشد');
    return station;
  }
}

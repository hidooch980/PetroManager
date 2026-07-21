import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UserRole } from '@prisma/client';

interface CreateUserInput {
  fullName: string;
  username: string;
  password: string;
  role?: UserRole;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(input: CreateUserInput) {
    const passwordHash = await bcrypt.hash(input.password, 10);
    const user = await this.prisma.user.create({
      data: {
        fullName: input.fullName,
        username: input.username,
        passwordHash,
        role: input.role ?? UserRole.OPERATOR,
      },
    });
    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: { id: true, fullName: true, username: true, role: true, isActive: true, createdAt: true },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, fullName: true, username: true, role: true, isActive: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('کاربر پیدا نشد');
    return user;
  }

  async deactivate(id: string) {
    return this.prisma.user.update({ where: { id }, data: { isActive: false } });
  }
}

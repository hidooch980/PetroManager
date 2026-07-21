import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

interface CreateEmployeeInput {
  fullName: string;
  nationalId?: string;
  phone?: string;
  position?: string;
  hireDate?: Date;
  baseSalary?: number;
  userId?: string;
}

@Injectable()
export class EmployeesService {
  constructor(private readonly prisma: PrismaService) {}

  create(input: CreateEmployeeInput) {
    return this.prisma.employee.create({ data: input });
  }

  findAll() {
    return this.prisma.employee.findMany({ where: { isActive: true } });
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({ where: { id } });
    if (!employee) throw new NotFoundException('کارمند پیدا نشد');
    return employee;
  }

  // ---------- حضور و غیاب ----------

  async checkIn(employeeId: string, note?: string) {
    const openAttendance = await this.prisma.attendance.findFirst({
      where: { employeeId, checkOut: null },
    });
    if (openAttendance) {
      throw new BadRequestException('این کارمند از قبل ورود ثبت‌شده بدون خروج دارد');
    }
    return this.prisma.attendance.create({
      data: { employeeId, checkIn: new Date(), note },
    });
  }

  async checkOut(attendanceId: string) {
    const attendance = await this.prisma.attendance.findUnique({ where: { id: attendanceId } });
    if (!attendance) throw new NotFoundException('رکورد حضور پیدا نشد');
    if (attendance.checkOut) throw new BadRequestException('خروج قبلاً ثبت شده است');

    return this.prisma.attendance.update({
      where: { id: attendanceId },
      data: { checkOut: new Date() },
    });
  }

  findAttendanceByEmployee(employeeId: string) {
    return this.prisma.attendance.findMany({
      where: { employeeId },
      orderBy: { checkIn: 'desc' },
    });
  }
}

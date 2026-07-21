import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminUsername = process.env.SEED_ADMIN_USERNAME ?? 'admin';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'admin123456';

  const existing = await prisma.user.findUnique({ where: { username: adminUsername } });
  if (existing) {
    console.log(`کاربر ادمین "${adminUsername}" از قبل وجود دارد — رد شد.`);
  } else {
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await prisma.user.create({
      data: {
        fullName: 'مدیر سیستم',
        username: adminUsername,
        passwordHash,
        role: UserRole.ADMIN,
      },
    });
    console.log(`کاربر ادمین ساخته شد → username: ${adminUsername} / password: ${adminPassword}`);
    console.log('توجه: بعد از اولین ورود، رمز عبور را تغییر دهید.');
  }

  const stationCount = await prisma.station.count();
  if (stationCount === 0) {
    await prisma.station.create({
      data: {
        name: 'جایگاه مرکزی',
      },
    });
    console.log('جایگاه پیش‌فرض ساخته شد.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

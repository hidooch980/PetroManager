# PetroManager-AI

سیستم مدیریت جایگاه سوخت — بک‌اند NestJS + Prisma + PostgreSQL، اپلیکیشن موبایل Flutter (Android).
تمام ۶ مرحله نقشه راه پیاده‌سازی شده‌اند.

## ساختار پروژه

```text
PetroManager-AI/
├── backend/                # NestJS API (پورت پیش‌فرض: 5300)
│   ├── prisma/schema.prisma
│   ├── prisma/seed.ts
│   └── src/modules/         # auth, users, stations, employees, shifts,
│                             # fuel, sales, expenses, payroll, insurance, tax, reports
├── mobile/                  # Flutter Android App (لاگین، داشبورد، ثبت فروش)
├── .github/workflows/       # CI بک‌اند + ساخت خودکار APK
├── docker-compose.yml       # PostgreSQL محلی
└── README.md
```

## شروع سریع (توسعه محلی)

### ۱. دیتابیس

```bash
docker compose up -d
```

### ۲. بک‌اند

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run start:dev
```

سرور روی `http://localhost:5300` بالا می‌آید. کاربر ادمین پیش‌فرض از seed:
`admin` / `admin123456` (حتماً در `.env` تغییر بدهید یا بعد از اولین ورود عوض کنید).

### ۳. موبایل

```bash
cd mobile
flutter create --platforms=android --org com.petromanager .   # فقط بار اول — پوشه android/ را می‌سازد
flutter pub get
flutter run
```

جزئیات بیشتر در `mobile/android/SETUP.md`. ساخت نسخه release APK فقط از طریق
GitHub Actions (`.github/workflows/build-apk.yml`) انجام می‌شود.

## نقشه راه توسعه (همه مراحل تکمیل شده)

| مرحله | موضوع | وضعیت |
|---|---|---|
| ۱ | هسته: NestJS, Prisma, PostgreSQL, Auth, Users, تنظیمات جایگاه | ✅ |
| ۲ | عملیات جایگاه: سوخت، موجودی مخازن، فروش، هزینه‌ها | ✅ |
| ۳ | مدیریت کارکنان: Employees, Shifts, حضور و غیاب، تسویه صندوق | ✅ |
| ۴ | مالی: Payroll, Insurance, Tax | ✅ |
| ۵ | گزارش‌ها: فروش، مصرف سوخت، هزینه، سود و زیان، عملکرد، شیفت‌ها | ✅ |
| ۶ | اپلیکیشن Flutter Android: لاگین، داشبورد، ثبت فروش | ✅ |

## ماژول‌های بک‌اند

- `common/prisma` — سرویس و ماژول سراسری Prisma
- `modules/auth` — ورود با JWT
- `modules/users` — مدیریت کاربران (نقش: ADMIN / MANAGER / OPERATOR)
- `modules/stations` — تنظیمات جایگاه
- `modules/employees` — CRUD کارمند + حضور و غیاب (`check-in` / `check-out`)
- `modules/shifts` — باز/بسته‌کردن شیفت با تسویه خودکار صندوق (`cashDifference`)
- `modules/fuel` — مخازن سوخت + ثبت تحویل سوخت (افزایش خودکار موجودی)
- `modules/sales` — ثبت فروش؛ در صورت اتصال به مخزن، موجودی به‌صورت اتمیک کسر می‌شود
- `modules/expenses` — ثبت هزینه‌های جاری
- `modules/payroll` — تولید فیش حقوقی ماهانه از حقوق پایه + پاداش/کسورات
- `modules/insurance` — محاسبه سهم بیمه کارمند/کارفرما (نرخ‌ها در `.env` قابل تنظیم — **قبل از استفاده واقعی با نرخ رسمی مطابقت دهید**)
- `modules/tax` — محاسبه مالیات ساده (نرخ در `.env` قابل تنظیم — **قبل از استفاده واقعی با قانون مالیات مستقیم مطابقت دهید**)
- `modules/reports` — گزارش فروش روزانه/ماهانه، موجودی سوخت، هزینه‌ها، سود و زیان، عملکرد کارکنان، شیفت‌ها

### جریان نمونه برای تست دستی (End-to-End)

```bash
POST /auth/login                → دریافت accessToken (کاربر seed شده)
POST /stations                  → ساخت جایگاه (اگر seed اجرا نشده)
POST /employees                 → ساخت کارمند
POST /employees/:id/check-in    → ثبت ورود کارمند
POST /fuel-tanks                → ساخت مخزن برای همان جایگاه
POST /fuel-deliveries           → افزایش موجودی مخزن
POST /shifts/open               → باز کردن شیفت برای همان کارمند
POST /sales                     → ثبت فروش (با tankId → کسر خودکار موجودی)
POST /expenses                  → ثبت هزینه روی همان شیفت
POST /shifts/:id/close          → بستن شیفت و محاسبه اختلاف صندوق
POST /employees/attendance/:attendanceId/check-out → ثبت خروج کارمند
POST /payroll                   → تولید فیش حقوقی ماهانه
POST /insurance                 → محاسبه سهم بیمه
POST /tax                       → محاسبه مالیات
GET  /reports/profit-loss       → گزارش سود و زیان
```

## نکات مهم قبل از استقرار واقعی (Production)

- `JWT_SECRET` را در `.env` به یک مقدار تصادفی و قوی تغییر دهید.
- نرخ‌های `INSURANCE_EMPLOYEE_RATE` / `INSURANCE_EMPLOYER_RATE` / `TAX_RATE` نمونه‌اند —
  باید با مقررات رسمی تطبیق داده شوند.
- در `mobile/lib/services/api_config.dart`، آدرس `API_BASE_URL` را برای دستگاه واقعی
  یا سرور دیپلوی‌شده تنظیم کنید (مقدار پیش‌فرض فقط برای امولاتور اندروید است).
- endpoint ثبت‌نام عمومی عمداً وجود ندارد؛ کاربران فقط توسط ادمین (`POST /users`) ساخته می‌شوند.

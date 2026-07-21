class ApiConfig {
  // برای تست روی Emulator اندروید: از 10.0.2.2 به‌جای localhost استفاده کنید.
  // برای دستگاه واقعی: آدرس IP سرور در شبکه محلی یا دامنه دیپلوی‌شده را قرار دهید.
  static const String baseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:5300',
  );
}

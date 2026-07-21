# راه‌اندازی پوشه android/

فایل‌های native اندروید (Gradle wrapper، AndroidManifest.xml، MainActivity، آیکون‌ها و غیره)
باینری و وابسته به نسخه دقیق Flutter SDK هستند و نمی‌توان آن‌ها را دستی و درست ساخت.
درست‌ترین روش این است که در پوشه mobile/ دستور زیر اجرا شود (فقط یک‌بار، همان ابتدای کار):

```bash
cd mobile
flutter create --platforms=android --org com.petromanager .
```

این دستور پوشه android/ کامل را می‌سازد بدون اینکه به فایل‌های lib/ که از قبل نوشته شده‌اند
دست بزند (چون آن‌ها از قبل وجود دارند، flutter create آن‌ها را overwrite نمی‌کند مگر با --overwrite).

بعد از این مرحله:

```bash
flutter pub get
flutter run          # برای تست روی امولاتور/دستگاه متصل
flutter build apk     # برای ساخت APK دستی (در حالت عادی این کار را GitHub Actions انجام می‌دهد)
```

## نکته درباره application ID

بعد از `flutter create`، در `android/app/build.gradle` مقدار `applicationId` را چک کنید
(باید چیزی شبیه `com.petromanager.mobile` باشد) تا با نام پکیج نهایی هماهنگ باشد.

## نکته درباره حداقل نسخه اندروید

برای پکیج‌های `shared_preferences` و `http`، `minSdkVersion 21` یا بالاتر کافی است؛
مقدار پیش‌فرض flutter create معمولاً همین است.

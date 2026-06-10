const CACHE_NAME = 'ezwash-cache-v1';
// قائمة بجميع الملفات الأساسية التي يجب تخزينها مؤقتًا
const urlsToCache = [
  '/', // أو 'index.html' إذا كان هو الصفحة الرئيسية
  'index.html',
  'items.html',
  'paid.html', // إذا كانت صفحات ثابتة تحتاجها
  'receipts.html',
  'items.js',
  'script.js',
  'stt.css',
  'styl.css',
  'clock.png',
  'cog.png',
  'file.png',
  'karim.png',
  'usd.png',
  'manifest.json'
];

// خطوة التثبيت (Installation): يتم فيها تخزين جميع الملفات المذكورة
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// خطوة جلب البيانات (Fetch): يتم فيها اعتراض طلبات الشبكة
// وتقديم الملفات المخزنة مؤقتًا إذا كان المستخدم غير متصل بالإنترنت
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // إذا تم العثور على الملف في الذاكرة المؤقتة، يتم تقديمه
        if (response) {
          return response;
        }
        // وإلا، يتم محاولة جلب الملف من الشبكة
        return fetch(event.request);
      })
  );
});

// خطوة التفعيل (Activation): لإدارة إصدارات التخزين المؤقت القديمة
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName); // حذف الإصدارات القديمة
          }
        })
      );
    })
  );
});

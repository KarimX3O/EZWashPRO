let db;

/* فتح أو إنشاء قاعدة البيانات */
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("LaundryDB", 1);

    request.onupgradeneeded = function (e) {
      db = e.target.result;

      if (!db.objectStoreNames.contains("itemsM")) {
        db.createObjectStore("itemsM", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("itemsS")) {
        db.createObjectStore("itemsS", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("itemsSB")) {
        db.createObjectStore("itemsSB", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("receipts")) {
        db.createObjectStore("receipts", { keyPath: "id" });
      }
    };

    request.onsuccess = e => {
      db = e.target.result;
      resolve(db);
    };

    request.onerror = () => reject("❌ خطأ في IndexedDB");
  });
}

/* حفظ لائحة */
function saveList(storeName, list) {
  const tx = db.transaction(storeName, "readwrite");
  const store = tx.objectStore(storeName);
  store.clear();
  list.forEach(item => store.put(item));
}

/* جلب لائحة */
function loadList(storeName) {
  return new Promise(resolve => {
    const tx = db.transaction(storeName, "readonly");
    const store = tx.objectStore(storeName);
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result);
  });
}

/* حفظ وصل */
function saveReceiptDB(receipt) {
  const tx = db.transaction("receipts", "readwrite");
  tx.objectStore("receipts").put(receipt);
}

/* جلب جميع الوصلات */
function getReceiptsDB() {
  return new Promise(resolve => {
    const tx = db.transaction("receipts", "readonly");
    const req = tx.objectStore("receipts").getAll();
    req.onsuccess = () => resolve(req.result);
  });
}

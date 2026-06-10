// --- 1. إعدادات وقاعدة بيانات IndexedDB ---
const dbName = "LaundryDB";
const storeName = "receiptsStore";

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 3);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("receiptsStore")) {
        db.createObjectStore("receiptsStore", { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains("itemsStore")) {
        db.createObjectStore("itemsStore", { keyPath: "type" });
      }
      if (!db.objectStoreNames.contains("debtPayments")) {
  db.createObjectStore("debtPayments", { keyPath: "receiptId" });
}
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = (event) => reject(event.target.error);
  });
}

// --- 2. متغيرات النظام الأساسية ---
let selectedNumber = null;
let totalPrice = 0;

// المصفوفات الافتراضية
let TikitM = [
  { id: 1, name: "سروال", pric: 6 }, { id: 2, name: "قميجة", pric: 6 },
  { id: 3, name: "جلابة", pric: 6 }, { id: 4, name: "فيستة", pric: 6 },
  { id: 5, name: "جاكيطة", pric: 6 }, { id: 6, name: "مونطو", pric: 6 },
  { id: 7, name: "تكشطة", pric: 12 }, { id: 8, name: "قفطان", pric: 6 },
  { id: 9, name: "شورط", pric: 5 }, { id: 10, name: "كونبلي", pric: 12 },
  { id: 11, name: "صاية", pric: 6 }, { id: 12, name: "كسوة بنات طويلة", pric: 6 },
  { id: 13, name: "تريكو", pric: 6 }, { id: 14, name: "فوطة", pric: 3 }
];

let TikitS = [
  { id: 1, name: "سروال", pric: 10 }, { id: 2, name: "قميجة", pric: 10 },
  { id: 3, name: "جلابة", pric: 15 }, { id: 4, name: "فيستة", pric: 17 },
  { id: 5, name: "جاكيطة", pric: 15 }, { id: 6, name: "مونطو", pric: 20 },
  { id: 7, name: "تكشطة", pric: 30 }, { id: 8, name: "قفطان", pric: 15 },
  { id: 9, name: "سبرديلة", pric: 20 }, { id: 10, name: "شورط", pric: 10 },
  { id: 11, name: "كونبلي", pric: 30 }, { id: 12, name: "صاية", pric: 10 },
  { id: 13, name: "كسوة بنات طويلة", pric: 12 }, { id: 14, name: "تريكو", pric: 12 },
  { id: 15, name: "مانطا", pric: 35 }, { id: 16, name: "فوطة", pric: 10 },
  { id: 17, name: "كوفرلي", pric: 35 }, { id: 18, name: "زربية", pric: 20, byMeter: true }
];

let TikitSB = [
  { id: 1, name: "سروال", pric: 30 }, { id: 2, name: "قميجة", pric: 30 },
  { id: 3, name: "جلابة", pric: 30 }, { id: 4, name: "فيستة", pric: 30 },
  { id: 5, name: "جاكيطة", pric: 30 }, { id: 6, name: "مونطو", pric: 30 },
  { id: 7, name: "شورط", pric: 30 }, { id: 8, name: "كونبلي", pric: 30 },
  { id: 9, name: "صاية", pric: 30 }, { id: 10, name: "كسوة بنات طويلة", pric: 30 },
  { id: 11, name: "تريكو", pric: 30 }
];

let currentList = TikitM;

// --- 3. التاريخ والوقت ---
const today = new Date();
const dateString = today.toLocaleDateString('ar-MA');
const dateElement = document.getElementById("todayDate");
if (dateElement) dateElement.textContent = dateString;

// --- 4. دالات العرض والتحكم (UI Functions) ---
function selectNumber(num) {
  selectedNumber = num;
  document.querySelectorAll('.numbers button').forEach(btn => btn.classList.remove('selected'));
  if (event) event.target.classList.add('selected');
}

function createItemHTML(item) {
  const priceDisplay = item.byMeter ? `${item.pric}DH /متر` : `${item.pric}DH`;
  return `<div class="item-name">${item.name}</div>
          <div class="item-price">${priceDisplay}</div>`;
}

function renderItems(list) {
  const container = document.getElementById("itemsContainer");
  if (!container) return; // لضمان عدم حدوث خطأ في صفحات أخرى
  container.innerHTML = "";
  list.forEach(item => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = createItemHTML(item);
    div.onclick = () => item.byMeter ? addClothingByMeter(item.name, item.pric) : addClothing(item.name, item.pric);
    container.appendChild(div);
  });
}

function showCategory(cat) {
  // تحديث القائمة
  if (cat === 'm') currentList = TikitM;
  else if (cat === 's') currentList = TikitS;
  else if (cat === 'sb') currentList = TikitSB;

  // تحديث شكل الأزرار (فقط إذا كانت موجودة)
  const tabs = document.querySelectorAll(".tab");
  if (tabs.length > 0) {
    tabs.forEach(tab => tab.classList.remove("active"));
    if (cat === 'm') tabs[0].classList.add("active");
    else if (cat === 's') tabs[1].classList.add("active");
    else if (cat === 'sb') tabs[2].classList.add("active");
  }

  renderItems(currentList);
}

// --- 5. دالات العمليات (Logic Functions) ---
function addClothingByMeter(item, price) {
  let meters = parseFloat(prompt(`أدخل عدد الأمتار ل: ${item}`));
  if (isNaN(meters) || meters <= 0) {
    alert("⚠️ المرجو إدخال عدد أمتار صحيح!");
    return;
  }
  updateBill(item, price, meters, true);
}

function addClothing(item, price) {
  const quantity = selectedNumber || 1;
  updateBill(item, price, quantity, false);
  selectedNumber = null;
  document.querySelectorAll('.numbers button').forEach(btn => btn.classList.remove('selected'));
}

function updateBill(item, price, amount, isMeter) {
  const output = document.getElementById("output");
  if (!output) return;
  let lines = output.value.trim().split("\n").filter(l => l !== "");
  let updated = false;
  const unit = isMeter ? "متر " : "";

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(item)) {
      let parts = lines[i].split(" ");
      let oldAmount = parseFloat(parts[0]);
      let newAmount = oldAmount + amount;
      lines[i] = `${newAmount} ${unit}${item} ----------------->${price * newAmount}`;
      updated = true;
      break;
    }
  }

  if (!updated) {
    lines.push(`${amount} ${unit}${item} ----------------->${price * amount}`);
  }

  output.value = lines.join("\n");
  totalPrice += price * amount;
  const totalElem = document.getElementById("total");
  if (totalElem) totalElem.textContent = `المجموع: ${totalPrice} درهم`;
}

function clearAll() {
  const output = document.getElementById("output");
  const total = document.getElementById("total");
  const receiptId = document.getElementById("receiptId");
  if (output) output.value = "";
  if (total) total.textContent = "المجموع: 0 درهم";
  if (receiptId) receiptId.textContent = "----";
  totalPrice = 0;
  selectedNumber = null;
  const whatsappNum = document.getElementById("whatsappNumber");
  const clientName = document.getElementById("nameclione");
  if (whatsappNum) whatsappNum.value = "";
  if (clientName) clientName.value = "";
  document.querySelectorAll('.numbers button').forEach(btn => btn.classList.remove('selected'));
}

// --- 6. الإرسال والأرشفة ---
async function sendToWhatsapp() {
  const outputElem = document.getElementById("output");
  const numElem = document.getElementById("whatsappNumber");
  const nameElem = document.getElementById("nameclione");
  
  if (!outputElem || !numElem) return;
  
  const output = outputElem.value;
  const number = numElem.value.trim();
  const name = nameElem ? nameElem.value.trim() : "";
  const isFast = document.getElementById("fastWash")?.checked || false;
  const isPaid = document.getElementById("paid")?.checked || false;

  if (!number || !output) {
    alert("المرجو إدخال رقم واتساب واختيار الملابس أولاً.");
    return;
  }

  let lastId = parseInt(localStorage.getItem('lastReceiptId') || "0") + 1;
  let formattedId = lastId.toString().padStart(4, '0');
  const ridElem = document.getElementById("receiptId");
  if (ridElem) ridElem.textContent = formattedId;
  localStorage.setItem('lastReceiptId', lastId);

  const receiptRecord = {
    id: formattedId, date: dateString, name: name,
    number: number, content: output, total: totalPrice,
    fast: isFast, paid: isPaid
  };

  try {
    const db = await openDB();
    const tx = db.transaction(storeName, "readwrite");
    tx.objectStore(storeName).put(receiptRecord);
  } catch (err) { console.error("❌ فشل الحفظ:", err); }

  let receiptContent = `السلام عليكم مصبنة البحر ترحب بيكم 👋\nوصل رقم: ${formattedId}\nالتاريخ: ${dateString}\nالاسم: ${name}\n\n${output}\n---------------------\n💰 المجموع: ${totalPrice} درهم\n${isPaid ? "✅ تم الدفع" : ""}\nشكرا على ثقتكم 🙏`;
  let phone = number.startsWith("0") ? "212" + number.substring(1) : (number.startsWith("212") ? number : "212" + number);
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(receiptContent)}`, '_blank');
  clearAll();
}

// --- 7. دالات التنقل ---
function showReceipts() { window.location.href = 'receipts.html'; }
function showRecei() { window.location.href = 'items.html'; }
function stats() { window.location.href = 'stats.html'; }

// --- 8. دالة جلب الأثمنة من قاعدة البيانات عند التشغيل ---
async function loadPricesFromDB() {
  try {
    const db = await openDB();
    const tx = db.transaction("itemsStore", "readonly");
    const store = tx.objectStore("itemsStore");

    const reqM = store.get("m");
    const reqS = store.get("s");
    const reqSB = store.get("sb");

    reqM.onsuccess = () => { if(reqM.result) TikitM = reqM.result.data; };
    reqS.onsuccess = () => { if(reqS.result) TikitS = reqS.result.data; };
    reqSB.onsuccess = () => { 
      if(reqSB.result) TikitSB = reqSB.result.data;
      showCategory('m'); 
    };

  } catch (err) {
    console.warn("استخدام الأثمنة الافتراضية:", err);
    showCategory('m');
  }
}

// --- 9. تشغيل التطبيق النهائي ---
window.addEventListener('load', () => {
  loadPricesFromDB();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js').catch(err => console.log('SW failed', err));
  }
});


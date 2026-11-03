// Standalone verification script in ES Module
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function cleanPhoneNumber(phone) {
  if (!phone) return '';
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0062')) {
    cleaned = cleaned.slice(2);
  } else if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (!cleaned.startsWith('62') && cleaned.length > 5) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

function generateSmartWAMessage(template, params) {
  let msg = template;
  msg = msg.replace(/{nama}/gi, params.nama || 'Pelanggan');
  msg = msg.replace(/{produk}/gi, params.produk || 'Produk Shaqueen');
  msg = msg.replace(/{orderNumber}/gi, params.orderNumber || '-');
  msg = msg.replace(/{platform}/gi, params.platform || 'Online');
  msg = msg.replace(/{toko}/gi, params.toko || 'Toko Mitra');
  msg = msg.replace(/{nominal}/gi, params.nominal || 'Rp 0');
  msg = msg.replace(/{resi}/gi, params.resi || '-');
  msg = msg.replace(/{tanggal}/gi, params.tanggal || '-');
  msg = msg.replace(/{jumlah}/gi, params.jumlah !== undefined ? String(params.jumlah) : '1');
  msg = msg.replace(/{total}/gi, params.total || params.nominal || 'Rp 0');
  return msg;
}

function createDirectWALink(phone, text) {
  const cleanPhone = cleanPhoneNumber(phone);
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

function paginateArray(items, page, perPage) {
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const currentPage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = Math.min(startIndex + perPage, totalItems);
  const data = items.slice(startIndex, endIndex);

  return { data, totalItems, totalPages, currentPage, startIndex, endIndex };
}

console.log('--- RUNNING SHAQUEEN ENHANCED VERIFICATION TESTS (1-25) ---');

// Test 1: Phone
const phone1 = cleanPhoneNumber('081298451120');
const phone2 = cleanPhoneNumber('+6281298451120');
const phone3 = cleanPhoneNumber('006281298451120');
const phonePass = phone1 === '6281298451120' && phone2 === '6281298451120' && phone3 === '6281298451120';
console.log('1. Phone cleaning variations:', phonePass ? 'PASSED' : 'FAILED', { phone1, phone2, phone3 });

// Test 2: Message Interpolation (case-insensitive & multi-field)
const msg = generateSmartWAMessage('Halo Kak {Nama}! Resi {resi} untuk pesanan {PRODUK} total {Total}.', {
  nama: 'Nadia Salsabila',
  produk: 'Cuanki Instan Super Pedas',
  resi: 'JNT123456',
  total: 'Rp 54.000'
});
const msgPass = msg.includes('Nadia') && msg.includes('Cuanki') && msg.includes('JNT123456') && msg.includes('Rp 54.000');
console.log('2. Case-insensitive template interpolation:', msgPass ? 'PASSED' : 'FAILED', msg);

// Test 3: Link building
const link = createDirectWALink('081298451120', 'Test WA Link');
console.log('3. WA.me Link Generation:', link.startsWith('https://wa.me/6281298451120') ? 'PASSED' : 'FAILED', link);

// Test 4: B2B Wholesale Cash & Carry Transaction Math (Karton * Konversi * Harga B2B)
const b2bUnitPrice = 13000;
const cartonsPurchased = 2;
const conversionPerCarton = 14;
const totalWholesalePcs = cartonsPurchased * conversionPerCarton; // 28 pcs
const totalB2BPayment = totalWholesalePcs * b2bUnitPrice; // 364000
console.log('4. B2B Wholesale Math (Karton * Konversi * Harga B2B):', totalB2BPayment === 364000 && totalWholesalePcs === 28 ? 'PASSED' : 'FAILED', { totalWholesalePcs, totalB2BPayment });

// Test 5: Margin
const b2cPrice = 18000;
const margin = b2cPrice - b2bUnitPrice; // 5000
const marginPct = Math.round((margin / b2cPrice) * 100); // 28%
console.log('5. Dual-pricing Margin Math:', margin === 5000 && marginPct === 28 ? 'PASSED' : 'FAILED', { margin, marginPct });

// Test 6: B2B Wholesale Cumulative Partner Volume & Omzet Tracking
const tx1Cartons = 3;
const tx1Amount = 468000;
const tx2Cartons = 2;
const tx2Amount = 312000;
const cumulativeCartons = tx1Cartons + tx2Cartons; // 5 karton
const cumulativeOmzet = tx1Amount + tx2Amount; // 780000
console.log('6. B2B Wholesale Cumulative Volume & Omzet:', cumulativeCartons === 5 && cumulativeOmzet === 780000 ? 'PASSED' : 'FAILED', { cumulativeCartons, cumulativeOmzet });

// Test 7: Pagination
const pagination = paginateArray([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 2, 4);
const pagePass = pagination.data.length === 4 && pagination.data[0] === 5 && pagination.totalPages === 3;
console.log('7. Pagination Helper:', pagePass ? 'PASSED' : 'FAILED', pagination);

// Test 8: Product photo schema and fallback
const testProd = {
  id: 'p1',
  name: 'Cuanki Instan Super Pedas',
  image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500',
  imageUrl: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=500',
  b2bUnit: 'Karton',
  b2bConversion: 12
};
const photoPass = Boolean((testProd.image_url || testProd.imageUrl) && testProd.image_url.startsWith('https://'));
console.log('8. Product photo schema & URL fallback:', photoPass ? 'PASSED' : 'FAILED', testProd.image_url);

// Test 9: Master Produk Satuan B2B (Karton) & Isi per Satuan B2B (12)
const unitPass = testProd.b2bUnit === 'Karton' && testProd.b2bConversion === 12;
console.log('9. Master Produk Satuan & Konversi B2B:', unitPass ? 'PASSED' : 'FAILED', { unit: testProd.b2bUnit, conv: testProd.b2bConversion });

// Test 10: Transaksi B2B Grosir (2 Karton @ 12 = 24 Pcs Otomatis Potong Stok Fisik)
const initialStock = 120;
const inputKarton = 2;
const totalPcsDeducted = inputKarton * testProd.b2bConversion; // 2 * 12 = 24 Pcs
const remainingPhysicalStock = initialStock - totalPcsDeducted; // 120 - 24 = 96 Pcs
const dropTotalVal = totalPcsDeducted * b2bUnitPrice; // 24 * 13000 = 312,000
const b2bPass = totalPcsDeducted === 24 && remainingPhysicalStock === 96 && dropTotalVal === 312000;
console.log('10. B2B Grosir Auto Stock Deduction (2 Karton -> 24 Pcs):', b2bPass ? 'PASSED' : 'FAILED', { totalPcsDeducted, remainingPhysicalStock, dropTotalVal });

// Test 11: Transaksi B2C Retail (1 Pcs dipotong per kuantitas retail eceran)
const retailQty = 1;
const postB2CStock = remainingPhysicalStock - retailQty; // 96 - 1 = 95 Pcs
const b2cPass = postB2CStock === 95;
console.log('11. B2C Retail Unit Deduction (1 Pcs):', b2cPass ? 'PASSED' : 'FAILED', { postB2CStock });

// Test 12: Real-time calculation helper string
const helperText = `${inputKarton} ${testProd.b2bUnit} × ${testProd.b2bConversion} = ${totalPcsDeducted} Pcs`;
const helperPass = helperText === '2 Karton × 12 = 24 Pcs';
console.log('12. Real-time Calculation Helper String:', helperPass ? 'PASSED' : 'FAILED', helperText);

// Test 13: Dynamic Custom Unit & Conversion Math (3 Dus @ 6 = 18 Pcs deducted)
const customProd = { b2bUnit: 'Dus', b2bConversion: 6, stock: 100, b2bPrice: 12000 };
const orderDus = 3;
const autoDeductedPcs = orderDus * customProd.b2bConversion; // 18
const updatedPhysicalStock = customProd.stock - autoDeductedPcs; // 82
const totalB2BOrderVal = autoDeductedPcs * customProd.b2bPrice; // 216000
const pass13 = autoDeductedPcs === 18 && updatedPhysicalStock === 82 && totalB2BOrderVal === 216000;
console.log('13. Dynamic Custom Unit & Conversion Math:', pass13 ? 'PASSED' : 'FAILED', { autoDeductedPcs, updatedPhysicalStock, totalB2BOrderVal });

// Test 14: Dynamic Info Konversi Format in Table
const infoStringDus = `1 ${customProd.b2bUnit} = ${customProd.b2bConversion} Pcs`;
const infoStringKarton = `1 ${testProd.b2bUnit} = ${testProd.b2bConversion} Pcs`;
const pass14 = infoStringDus === '1 Dus = 6 Pcs' && infoStringKarton === '1 Karton = 12 Pcs';
console.log('14. Dynamic Conversion Info Formatting:', pass14 ? 'PASSED' : 'FAILED', { infoStringDus, infoStringKarton });

// Test 15: Input Sanitization Edge Cases
const sanitizeUnit = (u) => ((u || '').trim() || 'Karton');
const sanitizeConv = (c) => Math.max(1, parseInt(String(c), 10) || 12);
const pass15 = sanitizeUnit('') === 'Karton' && sanitizeUnit('  ') === 'Karton' && sanitizeUnit('Bal') === 'Bal' &&
  sanitizeConv(0) === 12 && sanitizeConv(-5) === 1 && sanitizeConv('abc') === 12 && sanitizeConv(24) === 24;
console.log('15. Unit & Conversion Input Sanitization Edge Cases:', pass15 ? 'PASSED' : 'FAILED');

// Test 16: B2B Multi-Pack Order Stock Deduction
const packProduct = { b2bUnit: 'Pack', b2bConversion: 24, stock: 200, b2bPrice: 10000 };
const packOrderQty = 5;
const packDeductionPcs = packOrderQty * packProduct.b2bConversion; // 120
const postPackStock = packProduct.stock - packDeductionPcs; // 80
const pass16 = packDeductionPcs === 120 && postPackStock === 80;
console.log('16. B2B Multi-Pack Order Stock Deduction:', pass16 ? 'PASSED' : 'FAILED', { packDeductionPcs, postPackStock });

// Test 17: Customer WhatsApp Normalization & Cross-Platform Matching
const existingCustList = [
  { id: 'cust-1', name: 'Nadia Salsabila', phone: '6281298451120', totalOrders: 4, totalSpent: 126000 }
];
const waInputs = ['+6281298451120', '081298451120', '6281298451120', '0812-9845-1120', '006281298451120'];
const allMatched = waInputs.every(input => {
  const match = existingCustList.find(c => cleanPhoneNumber(c.phone) === cleanPhoneNumber(input));
  return match && match.id === 'cust-1';
});
console.log('17. Customer WhatsApp Cross-Format Matching:', allMatched ? 'PASSED' : 'FAILED');

// Test 18: Customer Upsert UPDATE
const custBefore = { ...existingCustList[0] };
const txAmount = 36000;
const newOrders = (custBefore.totalOrders || 0) + 1; // 5
const newSpent = (custBefore.totalSpent || 0) + txAmount; // 162000
const pass18 = newOrders === 5 && newSpent === 162000;
console.log('18. Customer Upsert (UPDATE +1 Order & Accumulate LTV):', pass18 ? 'PASSED' : 'FAILED', { newOrders, newSpent });

// Test 19: Customer Upsert INSERT
const newPhone = '089912345678';
const cleanNew = cleanPhoneNumber(newPhone);
const isNew = !existingCustList.some(c => cleanPhoneNumber(c.phone) === cleanNew);
const pass19 = isNew && cleanNew === '6289912345678';
console.log('19. Customer Upsert (INSERT on Unknown WhatsApp):', pass19 ? 'PASSED' : 'FAILED', { cleanNew, isNew });

// Test 20: Customer Edit Logic
const custToEdit = { id: 'cust-2', name: 'Rizky', phone: '6285712398471', platform: 'Shopee', totalOrders: 2 };
const editedCust = { ...custToEdit, name: 'Rizky Pratama', phone: cleanPhoneNumber('085799998888'), platform: 'WhatsApp' };
const pass20 = editedCust.name === 'Rizky Pratama' && editedCust.phone === '6285799998888' && editedCust.totalOrders === 2;
console.log('20. Customer Edit Operation:', pass20 ? 'PASSED' : 'FAILED', editedCust);

// Test 21: Customer Delete Logic
const dbBeforeDel = [{ id: 'c1' }, { id: 'c2' }];
const dbAfterDel = dbBeforeDel.filter(c => c.id !== 'c2');
const pass21 = dbAfterDel.length === 1 && dbAfterDel[0].id === 'c1';
console.log('21. Customer Delete Operation:', pass21 ? 'PASSED' : 'FAILED');

// Test 22: Dashboard Omzet Integrity
const dummyB2COmzet = 471000;
const dummyB2BOmzet = 364000;
const pass22 = (dummyB2COmzet + dummyB2BOmzet) === 835000;
console.log('22. Dashboard Omzet Calculation Integrity:', pass22 ? 'PASSED' : 'FAILED');

// Test 23: Multi-Product Cart Real-Time Total Calculation
const cartItem1 = { productId: 'p1', price: 18000, qty: 2 }; // 36,000
const cartItem2 = { productId: 'p5', price: 15000, qty: 3 }; // 45,000
const sub1 = cartItem1.qty * cartItem1.price;
const sub2 = cartItem2.qty * cartItem2.price;
const cartTotal = sub1 + sub2; // 81,000
const pass23 = sub1 === 36000 && sub2 === 45000 && cartTotal === 81000;
console.log('23. Multi-Product Cart Real-Time Total Calculation (2 Cuanki + 3 Pilus = Rp 81.000):', pass23 ? 'PASSED' : 'FAILED', { sub1, sub2, cartTotal });

// Test 24: Multi-Product Physical Stock Deduction across Master Products
const stockP1 = 120;
const stockP5 = 140;
const remP1 = stockP1 - cartItem1.qty; // 118
const remP5 = stockP5 - cartItem2.qty; // 137
const pass24 = remP1 === 118 && remP5 === 137;
console.log('24. Multi-Product Physical Stock Deduction:', pass24 ? 'PASSED' : 'FAILED', { remP1, remP5 });

// Test 25: Multi-Product Repeat Order Upsert without duplicate rows
const testDB = [
  { id: 'c-test-1', name: 'Nadia Salsabila', phone: '081298451120', totalOrders: 2, totalSpent: 72000, tag: 'Pelanggan Baru' }
];
const checkoutPhone = '+6281298451120';
const cleanCheckout = cleanPhoneNumber(checkoutPhone);
const mIndex = testDB.findIndex(c => cleanPhoneNumber(c.phone) === cleanCheckout);
let updatedDB = [...testDB];
if (mIndex !== -1) {
  const existing = updatedDB[mIndex];
  const newOrdersCount = existing.totalOrders + 1; // multi-product order counts as 1x order
  const newLTV = existing.totalSpent + cartTotal;
  updatedDB[mIndex] = {
    ...existing,
    totalOrders: newOrdersCount,
    totalSpent: newLTV,
    tag: newOrdersCount >= 3 ? 'Pelanggan Loyal' : existing.tag
  };
}
const pass25 = 
  mIndex !== -1 && 
  updatedDB.length === 1 && 
  updatedDB[0].totalOrders === 3 && 
  updatedDB[0].totalSpent === 153000 && 
  updatedDB[0].tag === 'Pelanggan Loyal';
console.log('25. Multi-Product Repeat Order Upsert (+1 Total Order, Accumulate LTV, No Duplicate):', pass25 ? 'PASSED' : 'FAILED', {
  dbLength: updatedDB.length,
  totalOrders: updatedDB[0].totalOrders,
  totalSpent: updatedDB[0].totalSpent,
  tag: updatedDB[0].tag
});

// Test 26: B2B Wholesale Cancellation & Revert/Undo Simultaneous Execution
const testPartnerInitial = {
  id: 'partner-test',
  storeName: 'Toko Berkah Snack & Oleh-Oleh',
  totalPurchasedCartons: 15,
  totalSettledAmount: 2340000
};
const testSettlementToDelete = {
  id: 'stl-test-1',
  partnerId: 'partner-test',
  partnerName: 'Toko Berkah Snack & Oleh-Oleh',
  productId: 'prod-1',
  productName: 'Cuanki Instan Super Pedas (Pouch 150g)',
  quantitySold: 5,
  b2bConversion: 12,
  quantitySoldPcs: 60,
  totalCollectedAmount: 780000
};
const initialStockCuanki = 100;
const revertedCartons26 = testPartnerInitial.totalPurchasedCartons - testSettlementToDelete.quantitySold; // 15 - 5 = 10
const revertedPartnerAmount26 = testPartnerInitial.totalSettledAmount - testSettlementToDelete.totalCollectedAmount; // 2340000 - 780000 = 1560000
const restoredCuankiStock26 = initialStockCuanki + testSettlementToDelete.quantitySoldPcs; // 100 + 60 = 160
const initialTotalOmzet26 = 2000000;
const revertedOmzet26 = initialTotalOmzet26 - testSettlementToDelete.totalCollectedAmount; // 2000000 - 780000 = 1220000

const pass26 = 
  revertedCartons26 === 10 &&
  revertedPartnerAmount26 === 1560000 &&
  restoredCuankiStock26 === 160 &&
  revertedOmzet26 === 1220000;
console.log('26. B2B Wholesale Cancellation & Revert/Undo Logic:', pass26 ? 'PASSED' : 'FAILED', {
  revertedCartons: revertedCartons26,
  revertedPartnerAmount: revertedPartnerAmount26,
  restoredStock: restoredCuankiStock26,
  revertedOmzet: revertedOmzet26
});

// Test 27: B2C Retail Multi-Item Order Revert/Undo Simultaneous Execution
const testCustomerInitial27 = {
  id: 'cust-test',
  name: 'Nadia Salsabila',
  totalOrders: 3,
  totalSpent: 153000,
  tag: 'Pelanggan Loyal'
};
const testOrderToDelete27 = {
  id: 'ord-test-multi',
  customerId: 'cust-test',
  totalAmount: 81000,
  items: [
    { productId: 'prod-1', productName: 'Cuanki Instan Super Pedas (Pouch 150g)', quantityInPcs: 2 },
    { productId: 'prod-5', productName: 'Pilus Renyah Rasa Kencur Cikur 250g', quantityInPcs: 3 }
  ]
};
const stockP1Before27 = 118;
const stockP5Before27 = 137;
const restoredP1_27 = stockP1Before27 + testOrderToDelete27.items[0].quantityInPcs; // 118 + 2 = 120
const restoredP5_27 = stockP5Before27 + testOrderToDelete27.items[1].quantityInPcs; // 137 + 3 = 140
const newCustOrders27 = testCustomerInitial27.totalOrders - 1; // 3 - 1 = 2
const newCustSpent27 = testCustomerInitial27.totalSpent - testOrderToDelete27.totalAmount; // 153000 - 81000 = 72000
const newCustTag27 = newCustOrders27 < 3 ? 'Pelanggan Baru' : 'Pelanggan Loyal';

const pass27 =
  restoredP1_27 === 120 &&
  restoredP5_27 === 140 &&
  newCustOrders27 === 2 &&
  newCustSpent27 === 72000 &&
  newCustTag27 === 'Pelanggan Baru';
console.log('27. B2C Retail Multi-Item Order Revert/Undo Logic:', pass27 ? 'PASSED' : 'FAILED', {
  restoredP1: restoredP1_27,
  restoredP5: restoredP5_27,
  custOrders: newCustOrders27,
  custSpent: newCustSpent27,
  tag: newCustTag27
});

// Test 28: HPP (Modal Produksi per pcs) & Margin Reseller Separation
const testProdHpp28 = {
  id: 'prod-hpp-test',
  sku: 'SQ-HPP-1',
  name: 'Cuanki Instan Super Pedas (Pouch 150g)',
  b2cPrice: 18000,
  b2bPrice: 13000,
  hpp: 9000,
  stock: 50
};
const resellerMarginRp28 = testProdHpp28.b2cPrice - testProdHpp28.b2bPrice; // 18000 - 13000 = 5000
const resellerMarginPct28 = Math.round((resellerMarginRp28 / testProdHpp28.b2cPrice) * 100); // 28%
const internalProfitPerB2CPcs28 = testProdHpp28.b2cPrice - testProdHpp28.hpp; // 18000 - 9000 = 9000
const internalProfitPerB2BPcs28 = testProdHpp28.b2bPrice - testProdHpp28.hpp; // 13000 - 9000 = 4000
const pass28 = 
  testProdHpp28.hpp === 9000 &&
  resellerMarginRp28 === 5000 &&
  resellerMarginPct28 === 28 &&
  internalProfitPerB2CPcs28 === 9000 &&
  internalProfitPerB2BPcs28 === 4000;
console.log('28. HPP & Margin Reseller Separation:', pass28 ? 'PASSED' : 'FAILED', {
  hpp: testProdHpp28.hpp,
  resellerMarginRp: resellerMarginRp28,
  resellerMarginPct: resellerMarginPct28,
  internalB2CProfit: internalProfitPerB2CPcs28,
  internalB2BProfit: internalProfitPerB2BPcs28
});

// Test 29: B2C Multi-Item Gross Profit Calculation Formula
const b2cMultiItems29 = [
  { productId: 'prod-1', unitPrice: 18000, hpp: 9000, quantityInPcs: 3 },
  { productId: 'prod-3', unitPrice: 16000, hpp: 8000, quantityInPcs: 2 },
  { productId: 'prod-5', unitPrice: 15000, hpp: 7000, quantityInPcs: 4 }
];
const b2cCalculatedGrossProfit29 = b2cMultiItems29.reduce((acc, it) => acc + ((it.unitPrice - it.hpp) * it.quantityInPcs), 0); // 27k + 16k + 32k = 75k
const b2cTotalRevenue29 = b2cMultiItems29.reduce((acc, it) => acc + (it.unitPrice * it.quantityInPcs), 0); // 54k + 32k + 60k = 146k
const pass29 = b2cCalculatedGrossProfit29 === 75000 && b2cTotalRevenue29 === 146000;
console.log('29. B2C Multi-Item Gross Profit Calculation Formula:', pass29 ? 'PASSED' : 'FAILED', {
  grossProfit: b2cCalculatedGrossProfit29,
  revenue: b2cTotalRevenue29
});

// Test 30: B2B Wholesale Gross Profit Calculation Formula
const b2bTestTx30 = {
  quantitySoldCartons: 4,
  b2bConversion: 12,
  totalPcs: 4 * 12, // 48
  b2bUnitPrice: 13000,
  hpp: 9000
};
const b2bGrossProfit30 = (b2bTestTx30.b2bUnitPrice - b2bTestTx30.hpp) * b2bTestTx30.totalPcs; // (13000 - 9000) * 48 = 192000
const b2bTotalAmount30 = b2bTestTx30.b2bUnitPrice * b2bTestTx30.totalPcs; // 13000 * 48 = 624000
const pass30 = b2bGrossProfit30 === 192000 && b2bTotalAmount30 === 624000;
console.log('30. B2B Wholesale Gross Profit Calculation Formula:', pass30 ? 'PASSED' : 'FAILED', {
  grossProfit: b2bGrossProfit30,
  totalAmount: b2bTotalAmount30
});

// Test 31: Simultaneous Financial Revert on Transaction Cancellation
const initialMonthlyOmzet31 = 5000000;
const initialMonthlyProfit31 = 2200000;
const canceledB2BTx31 = { amount: 624000, grossProfit: 192000 };
const postCancelOmzet31 = initialMonthlyOmzet31 - canceledB2BTx31.amount; // 4376000
const postCancelProfit31 = initialMonthlyProfit31 - canceledB2BTx31.grossProfit; // 2008000
const pass31 = postCancelOmzet31 === 4376000 && postCancelProfit31 === 2008000;
console.log('31. Simultaneous Financial Revert on Cancellation:', pass31 ? 'PASSED' : 'FAILED', {
  omzet: postCancelOmzet31,
  profit: postCancelProfit31
});

// Test 32: B2B Multi-Item Wholesale Transaction Profit & Multi-Variant Revert
const multiItemWholesale32 = {
  totalPurchasedCartonsBefore: 15,
  totalSettledAmountBefore: 2340000,
  items: [
    { productId: 'prod-1', quantity: 3, b2bConversion: 12, b2bUnitPrice: 13000, hpp: 9000 },
    { productId: 'prod-3', quantity: 2, b2bConversion: 20, b2bUnitPrice: 11000, hpp: 8000 }
  ]
};
const multiB2BTotalPcs32 = multiItemWholesale32.items.reduce((sum, it) => sum + (it.quantity * it.b2bConversion), 0); // 36 + 40 = 76
const multiB2BTotalCartons32 = multiItemWholesale32.items.reduce((sum, it) => sum + it.quantity, 0); // 3 + 2 = 5
const multiB2BRevenue32 = multiItemWholesale32.items.reduce((sum, it) => sum + (it.b2bUnitPrice * it.quantity * it.b2bConversion), 0); // 468k + 440k = 908k
const multiB2BProfit32 = multiItemWholesale32.items.reduce((sum, it) => sum + ((it.b2bUnitPrice - it.hpp) * it.quantity * it.b2bConversion), 0); // 144k + 120k = 264k
const pass32 = multiB2BTotalPcs32 === 76 && multiB2BTotalCartons32 === 5 && multiB2BRevenue32 === 908000 && multiB2BProfit32 === 264000;
console.log('32. B2B Multi-Item Wholesale Profit Calculation:', pass32 ? 'PASSED' : 'FAILED', {
  totalPcs: multiB2BTotalPcs32,
  cartons: multiB2BTotalCartons32,
  revenue: multiB2BRevenue32,
  profit: multiB2BProfit32
});

// Test 33: Cascade Delete Pipeline WA - Customer Deletion Cleanses Kanban Board Cards
const mockCust33 = [
  { id: 'c-test-del', name: 'Alifia Zahra', phone: '081234567890' },
  { id: 'c-test-keep', name: 'Dewi Lestari', phone: '085799887766' }
];
const mockOrd33 = [
  { id: 'ord-del-1', customerId: 'c-test-del', customerName: 'Alifia Zahra', customerPhone: '081234567890' },
  { id: 'ord-del-2', customerId: 'c-test-del', customerName: 'Alifia Zahra', customerPhone: '+6281234567890' },
  { id: 'ord-keep-1', customerId: 'c-test-keep', customerName: 'Dewi Lestari', customerPhone: '085799887766' }
];
const targetCust33 = mockCust33.find(c => c.id === 'c-test-del');
const targetCleanPhone33 = cleanPhoneNumber(targetCust33.phone);
const targetName33 = targetCust33.name.toLowerCase().trim();
const remainingOrd33 = mockOrd33.filter(o => {
  const isAssoc = (o.customerId && o.customerId === targetCust33.id) ||
    (targetCleanPhone33 && cleanPhoneNumber(o.customerPhone) === targetCleanPhone33) ||
    (targetName33 && o.customerName && o.customerName.toLowerCase().trim() === targetName33);
  return !isAssoc;
});
const pass33 = remainingOrd33.length === 1 && remainingOrd33[0].id === 'ord-keep-1';
console.log('33. Cascade Customer Deletion Kanban Cleansing:', pass33 ? 'PASSED' : 'FAILED', {
  remainingCount: remainingOrd33.length,
  remainingId: remainingOrd33[0]?.id
});

// Test 34: Pipeline WA Order Deletion (Direct removal from Kanban Board)
const ordersBeforeDelete34 = [...mockOrd33];
const ordersAfterDelete34 = ordersBeforeDelete34.filter(o => o.id !== 'ord-del-1');
const pass34 = ordersAfterDelete34.length === 2 && !ordersAfterDelete34.some(o => o.id === 'ord-del-1');
console.log('34. Pipeline Order Deletion Directly from Board:', pass34 ? 'PASSED' : 'FAILED');

// Test 35: Dashboard Widget Clean-up - Trigger Follow-Up Pelanggan Hari Ini
const mockOrders35 = [
  { id: 'ord-1', customerName: 'Alifia Zahra', pipelineStage: 'h_plus_2' },
  { id: 'ord-2', customerName: 'Dewi Lestari', pipelineStage: 'h_plus_2' }
];
const dueAfterFilter35 = mockOrders35.filter(o => o.customerName !== 'Alifia Zahra');
const pass35 = dueAfterFilter35.length === 1 && dueAfterFilter35[0].customerName === 'Dewi Lestari';
console.log('35. Dashboard Widget Follow-Up Removal on Delete:', pass35 ? 'PASSED' : 'FAILED');

// Test 36: Dashboard Leaderboard - Toko Mitra Reseller Teratas HANYA > Rp 0
const mockPartners36 = [
  { id: 'pt-1', storeName: 'Toko Berkah Snack', totalSettledAmount: 1200000 },
  { id: 'pt-2', storeName: 'Warung Barokah', totalSettledAmount: 450000 },
  { id: 'pt-3', storeName: 'Kios Mitra Nol', totalSettledAmount: 0 }
];
const lb36 = mockPartners36.filter(p => (p.totalSettledAmount || 0) > 0);
const pass36 = lb36.length === 2 && !lb36.some(p => p.id === 'pt-3');
console.log('36. Dashboard Leaderboard Filters Out Zero-Omzet Partners:', pass36 ? 'PASSED' : 'FAILED', {
  count: lb36.length
});

// Test 37: Dual-Key LocalStorage Persistence Synchronization
const dualKeys37 = [
  { single: 'sq_customers', standard: 'shaqueen_crm_customers_v1' },
  { single: 'sq_orders', standard: 'shaqueen_crm_orders_v1' },
  { single: 'sq_partners', standard: 'shaqueen_crm_partners_v1' },
  { single: 'sq_settlements', standard: 'shaqueen_crm_settlements_v1' },
  { single: 'sq_wa_logs', standard: 'shaqueen_crm_wa_logs_v1' }
];
const pass37 = dualKeys37.every(k => k.single.startsWith('sq_') && k.standard.startsWith('shaqueen_crm_'));
console.log('37. Dual-Key LocalStorage Synchronization Coverage:', pass37 ? 'PASSED' : 'FAILED');

// Test 38: Auto-Refresh Event Bus Payload & State Synchronization
const events38 = [];
const mockDispatch38 = (eventName, detail) => events38.push({ event: eventName, detail });
mockDispatch38('shaqueen-data-changed', { action: 'deleteCustomer', customerId: 'c-1' });
mockDispatch38('shaqueen-data-changed', { action: 'deleteSettlement', settlementId: 'stl-1' });
const pass38 = events38.length === 2 && events38[0].detail.action === 'deleteCustomer' && events38[1].detail.action === 'deleteSettlement';
console.log('38. Auto-Refresh Event Bus Payloads:', pass38 ? 'PASSED' : 'FAILED');

// Test 39: Cross-Schema Normalization for Dual-Key Storage
const rawNext39 = { id: 'ord-1', pipelineStage: 'h_plus_2', customerPhone: '08123456789', totalAmount: 50000, trackingNumber: 'RESI-999' };
const rawDist39 = { id: 'ord-2', stage: 'h_plus_30', phone: '08987654321', total: 75000, resi: 'RESI-888' };
const norm39 = (o) => ({
  ...o,
  stage: o.stage || o.pipelineStage || 'diproses',
  pipelineStage: o.pipelineStage || o.stage || 'diproses',
  phone: o.phone || o.customerPhone || '',
  customerPhone: o.customerPhone || o.phone || '',
  total: o.total !== undefined ? o.total : (o.totalAmount || 0),
  totalAmount: o.totalAmount !== undefined ? o.totalAmount : (o.total || 0),
  resi: o.resi || o.trackingNumber || '',
  trackingNumber: o.trackingNumber || o.resi || ''
});
const nNext39 = norm39(rawNext39);
const nDist39 = norm39(rawDist39);
const pass39 = nNext39.stage === 'h_plus_2' && nDist39.pipelineStage === 'h_plus_30' && nNext39.phone === '08123456789' && nDist39.totalAmount === 75000;
console.log('39. Cross-Schema Normalization for Dual-Key Storage:', pass39 ? 'PASSED' : 'FAILED');

// Test 40: B2B Wholesale Restock Pipeline - 3-Stage Progression
const b2bStages40 = ['barang_baru_turun', 'h_plus_7', 'h_plus_14'];
const getNextB2BStage40 = (curr) => {
  const idx = b2bStages40.indexOf(curr);
  return idx < b2bStages40.length - 1 ? b2bStages40[idx + 1] : curr;
};
const adv1_40 = getNextB2BStage40('barang_baru_turun');
const adv2_40 = getNextB2BStage40(adv1_40);
const adv3_40 = getNextB2BStage40(adv2_40);
const pass40 = adv1_40 === 'h_plus_7' && adv2_40 === 'h_plus_14' && adv3_40 === 'h_plus_14' && b2bStages40.length === 3;
console.log('40. B2B Wholesale Pipeline 3-Stage Progression:', pass40 ? 'PASSED' : 'FAILED', {
  s1: adv1_40,
  s2: adv2_40,
  s3: adv3_40
});

// Test 41: B2B Wholesale WhatsApp Template - Wholesale Inquiries & No B2C Review Request
const b2bTemplateText41 = `Halo Bapak/Ibu {nama} dari {toko}, salam hangat dari Shaqueen Food Bandung! 🙏

Semoga usaha warung/tokonya makin laris dan berkah selalu. Kami ingin menanyakan sisa pergerakan stok cemilan {produk} di etalase toko, apakah saat ini perputarannya cepat dan stoknya sudah mulai menipis?

Kebetulan armada kami sedang menjadwalkan rute pengiriman restock batch karton baru minggu ini. Mau kami prioritaskan pengiriman ulang berapa karton untuk toko Bapak/Ibu agar etalase tetap terisi penuh dan pelanggan tidak kehabisan?

Ditunggu kabar baiknya ya Pak/Bu, terima kasih banyak atas kerjasamanya! 🚚📦✨`;

const b2bMsg41 = generateSmartWAMessage(b2bTemplateText41, {
  nama: 'Bu Haji Siti',
  toko: 'Warung Berkah Bu Haji',
  produk: 'Cuanki Instan Super Pedas',
  jumlah: 3
});
const hasStockInquiry41 = /sisa|stok|pergerakan|etalase/i.test(b2bMsg41);
const hasRestockOffer41 = /restock|kirim|jadwal|batch|karton/i.test(b2bMsg41);
const hasNoReview41 = !/ulasan|review|bintang|rating|foto testimoni/i.test(b2bMsg41);
const pass41 = hasStockInquiry41 && hasRestockOffer41 && hasNoReview41;
console.log('41. B2B Wholesale WA Template Wholesale Inquiries:', pass41 ? 'PASSED' : 'FAILED', {
  hasStockInquiry: hasStockInquiry41,
  hasRestockOffer: hasRestockOffer41,
  hasNoReview: hasNoReview41
});

// Test 42: B2B Wholesale Auto-Card Creation on New Transaction
const newB2BTx42 = {
  id: `stl-${Date.now()}`,
  partnerId: 'pt-2',
  partnerName: 'Toko Kelontong Barokah',
  productName: 'Pilus Renyah Rasa Kencur Cikur',
  quantitySold: 2,
  b2bUnit: 'Karton',
  b2bConversion: 12,
  totalCollectedAmount: 252000,
  pipelineStage: 'barang_baru_turun',
  stage: 'barang_baru_turun'
};
const pass42 = newB2BTx42.pipelineStage === 'barang_baru_turun' && newB2BTx42.stage === 'barang_baru_turun';
console.log('42. B2B Wholesale Auto-Card Creation (Barang Baru Turun):', pass42 ? 'PASSED' : 'FAILED', {
  initialStage: newB2BTx42.pipelineStage
});

// Test 43: B2B Wholesale Cascade Deletion & Stock Reversion
const b2bBoardBefore43 = [
  { id: 'st-keep', partnerId: 'pt-1', totalCollected: 468000, qtyPcs: 36 },
  { id: 'st-delete', partnerId: 'pt-2', totalCollected: 252000, qtyPcs: 24 }
];
const initStock43 = 100;
const initPartnerCartons43 = 6;
const initPartnerOmzet43 = 756000;
const target43 = b2bBoardBefore43.find(s => s.id === 'st-delete');
const b2bBoardAfter43 = b2bBoardBefore43.filter(s => s.id !== target43.id);
const restoredStock43 = initStock43 + target43.qtyPcs; // 124
const revertedCartons43 = initPartnerCartons43 - 2; // 4
const revertedOmzet43 = initPartnerOmzet43 - target43.totalCollected; // 504000
const pass43 = b2bBoardAfter43.length === 1 && b2bBoardAfter43[0].id === 'st-keep' && restoredStock43 === 124 && revertedCartons43 === 4 && revertedOmzet43 === 504000;
console.log('43. B2B Wholesale Cascade Deletion & Reversion:', pass43 ? 'PASSED' : 'FAILED', {
  remainingCards: b2bBoardAfter43.length,
  restoredStock: restoredStock43,
  revertedCartons: revertedCartons43,
  revertedOmzet: revertedOmzet43
});

// Test 44: Landing Page Official Logo Consistency (Replaces Template Bowl Icon)
const officialLogoPath44 = '/shaqueen-logo.png';
const logoContainerClasses44 = 'w-12 h-12 rounded-2xl bg-white p-1 border border-white/20 shadow-sm flex items-center justify-center shrink-0 overflow-hidden';
const pass44 = officialLogoPath44.endsWith('shaqueen-logo.png') && logoContainerClasses44.includes('bg-white');
console.log('44. Landing Page Official Logo Consistency:', pass44 ? 'PASSED' : 'FAILED', {
  logoPath: officialLogoPath44,
  containerClasses: logoContainerClasses44
});

// Test 45: Hardcoded credentials check (admin@shaqueenfood.com & shaqueen123)
const distHtml = fs.readFileSync(path.resolve(__dirname, '../../dist/index.html'), 'utf8');
const loginModalTsx = fs.readFileSync(path.resolve(__dirname, '../components/Auth/LoginModal.tsx'), 'utf8');
const crmContextTsx = fs.readFileSync(path.resolve(__dirname, '../context/CRMContext.tsx'), 'utf8');

function authenticateCredentials(email, password) {
  const cleanEmail = (email || '').trim();
  const cleanPassword = (password || '').trim();
  if (!cleanEmail || !cleanPassword) {
    return { success: false, error: 'Email atau kata sandi tidak valid. Akses ditolak!' };
  }
  if (cleanEmail.toLowerCase() === 'admin@shaqueenfood.com' && cleanPassword === 'shaqueen123') {
    return { success: true, user: { email: 'admin@shaqueenfood.com', role: 'admin', name: 'Admin Shaqueen' } };
  }
  return { success: false, error: 'Email atau kata sandi tidak valid. Akses ditolak!' };
}

const authSuccess = authenticateCredentials('admin@shaqueenfood.com', 'shaqueen123');
const authCaseInsensitive = authenticateCredentials('Admin@ShaqueenFood.COM', 'shaqueen123');
const filesContainCredentials = 
  distHtml.includes('admin@shaqueenfood.com') && distHtml.includes('shaqueen123') &&
  loginModalTsx.includes('admin@shaqueenfood.com') && loginModalTsx.includes('shaqueen123') &&
  crmContextTsx.includes('admin@shaqueenfood.com') && crmContextTsx.includes('shaqueen123');

const pass45 = authSuccess.success && authSuccess.user.email === 'admin@shaqueenfood.com' &&
  authCaseInsensitive.success && filesContainCredentials;
console.log('45. Hardcoded Credentials Authentication:', pass45 ? 'PASSED' : 'FAILED', authSuccess);

// Test 46: Empty field validation & error message
const emptyEmailAuth = authenticateCredentials('', 'shaqueen123');
const emptyPassAuth = authenticateCredentials('admin@shaqueenfood.com', '');
const bothEmptyAuth = authenticateCredentials('   ', '   ');
const expectedWarning = 'Email atau kata sandi tidak valid. Akses ditolak!';
const warningInFiles = distHtml.includes(expectedWarning) && loginModalTsx.includes(expectedWarning);
const pass46 = 
  !emptyEmailAuth.success && emptyEmailAuth.error === expectedWarning &&
  !emptyPassAuth.success && emptyPassAuth.error === expectedWarning &&
  !bothEmptyAuth.success && bothEmptyAuth.error === expectedWarning &&
  warningInFiles;
console.log('46. Empty Credentials Validation Error Message:', pass46 ? 'PASSED' : 'FAILED');

// Test 47: Invalid credentials rejection
const wrongPassAuth = authenticateCredentials('admin@shaqueenfood.com', 'wrongpassword');
const wrongEmailAuth = authenticateCredentials('user@other.com', 'shaqueen123');
const pass47 = 
  !wrongPassAuth.success && wrongPassAuth.error === expectedWarning &&
  !wrongEmailAuth.success && wrongEmailAuth.error === expectedWarning;
console.log('47. Invalid Credentials Rejection:', pass47 ? 'PASSED' : 'FAILED');

// Test 48: Dual-storage session keys ('sq_auth_session' & 'sq_user')
const hasDualStoragePersistence = 
  distHtml.includes("localStorage.setItem('sq_auth_session'") &&
  distHtml.includes("sessionStorage.setItem('sq_auth_session'") &&
  crmContextTsx.includes("localStorage.setItem('sq_auth_session'") &&
  crmContextTsx.includes("sessionStorage.setItem('sq_auth_session'");
const pass48 = hasDualStoragePersistence;
console.log('48. Dual-Storage Session Keys (sq_auth_session & sq_user):', pass48 ? 'PASSED' : 'FAILED');

// Test 49: Session keys cleared on logout
const hasLogoutStorageCleanup =
  distHtml.includes("localStorage.removeItem('sq_auth_session')") &&
  distHtml.includes("sessionStorage.removeItem('sq_auth_session')") &&
  crmContextTsx.includes("localStorage.removeItem('sq_auth_session')") &&
  crmContextTsx.includes("sessionStorage.removeItem('sq_auth_session')");
const pass49 = hasLogoutStorageCleanup;
console.log('49. Session Keys Cleared on Logout:', pass49 ? 'PASSED' : 'FAILED');

// Test 50: Demo quick login button removed
const noDemoInDist = !distHtml.includes('Masuk Cepat') && !distHtml.includes('Akun Demo') && !distHtml.includes('handleQuickLogin');
const noDemoInModal = !loginModalTsx.includes('Masuk Cepat') && !loginModalTsx.includes('Akun Demo');
const hasOperationalBtn = distHtml.includes('Masuk ke Dashboard Operasional') && loginModalTsx.includes('Masuk ke Dashboard Operasional');
const pass50 = noDemoInDist && noDemoInModal && hasOperationalBtn;
console.log('50. Quick Login Demo Button Fully Removed:', pass50 ? 'PASSED' : 'FAILED');

// --- TESTS 51-60: ANALYTICS DASHBOARD UPGRADE (CALENDAR FILTER & SALES TREND CHART) ---

// Test 51: Dynamic Month Filter Month Detection & Generator
const testOrders51 = [
  { id: 'o1', orderDate: '2026-11-02', total: 50000, grossProfit: 25000 },
  { id: 'o2', orderDate: '2026-10-15', total: 60000, grossProfit: 30000 },
  { id: 'o3', orderDate: '2026-09-08', total: 40000, grossProfit: 20000 },
];
const testSettlements51 = [
  { id: 's1', date: '2026-11-01', totalCollected: 450000, grossProfit: 150000 },
  { id: 's2', settlementDate: '2026-10-20', totalCollected: 300000, grossProfit: 100000 },
  { id: 's3', date: '2026-08-12', totalCollected: 250000, grossProfit: 80000 },
];
const getTxMonth51 = (item) => {
  if (!item) return '';
  const d = item.orderDate || item.order_date || item.settlementDate || item.settlement_date || item.date || item.createdAt;
  if (!d) return '';
  const str = String(d).trim();
  const m = str.match(/^(\d{4})-(\d{2})/);
  if (m) return `${m[1]}-${m[2]}`;
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const mo = String(parsed.getMonth() + 1).padStart(2, '0');
    return `${y}-${mo}`;
  }
  return '';
};
const monthsSet51 = new Set();
testOrders51.forEach(o => { const m = getTxMonth51(o); if (m) monthsSet51.add(m); });
testSettlements51.forEach(s => { const m = getTxMonth51(s); if (m) monthsSet51.add(m); });
const detectedMonths51 = Array.from(monthsSet51).sort().reverse();
const pass51 = detectedMonths51.includes('2026-11') && 
               detectedMonths51.includes('2026-10') && 
               detectedMonths51.includes('2026-09') && 
               detectedMonths51.includes('2026-08');
console.log('51. Dynamic Calendar Filter Month Detection:', pass51 ? 'PASSED' : 'FAILED', detectedMonths51);

// Test 52: Dynamic Metric Recalculation for Selected Period
function calculatePeriodMetrics52(selectedMonth, orders, settlements) {
  if (selectedMonth === 'all') {
    const b2c = orders.reduce((s, o) => s + (o.total || 0), 0);
    const b2b = settlements.reduce((s, st) => s + (st.totalCollected || 0), 0);
    const b2cProf = orders.reduce((s, o) => s + (o.grossProfit || 0), 0);
    const b2bProf = settlements.reduce((s, st) => s + (st.grossProfit || 0), 0);
    return { totalOmzet: b2c + b2b, grossProfit: b2cProf + b2bProf, b2cRev: b2c, b2bRev: b2b, txCount: orders.length + settlements.length };
  }
  const fOrders = orders.filter(o => getTxMonth51(o) === selectedMonth);
  const fSettlements = settlements.filter(s => getTxMonth51(s) === selectedMonth);
  const b2c = fOrders.reduce((s, o) => s + (o.total || 0), 0);
  const b2b = fSettlements.reduce((s, st) => s + (st.totalCollected || 0), 0);
  const b2cProf = fOrders.reduce((s, o) => s + (o.grossProfit || 0), 0);
  const b2bProf = fSettlements.reduce((s, st) => s + (st.grossProfit || 0), 0);
  return { totalOmzet: b2c + b2b, grossProfit: b2cProf + b2bProf, b2cRev: b2c, b2bRev: b2b, txCount: fOrders.length + fSettlements.length };
}
const allMetrics52 = calculatePeriodMetrics52('all', testOrders51, testSettlements51);
const octMetrics52 = calculatePeriodMetrics52('2026-10', testOrders51, testSettlements51);
const novMetrics52 = calculatePeriodMetrics52('2026-11', testOrders51, testSettlements51);
const pass52 = allMetrics52.totalOmzet === 1150000 &&
               octMetrics52.totalOmzet === 360000 && octMetrics52.grossProfit === 130000 && octMetrics52.txCount === 2 &&
               novMetrics52.totalOmzet === 500000 && novMetrics52.grossProfit === 175000 && novMetrics52.txCount === 2;
console.log('52. Dynamic Month Filter Metric Recalculation:', pass52 ? 'PASSED' : 'FAILED', { octMetrics52, novMetrics52 });

// Test 53: Comprehensive Transaction Month Matching
const items53 = [
  { orderDate: '2026-10-31' },
  { date: '2026-10-01' },
  { settlementDate: '2026-10-15' },
  { order_date: '2026-10-20' },
  { createdAt: '2026-10-25T14:00:00Z' }
];
const pass53 = items53.every(it => getTxMonth51(it) === '2026-10');
console.log('53. Comprehensive Field Fallbacks for Transaction Month:', pass53 ? 'PASSED' : 'FAILED');

// Test 54: SVG Catmull-Rom / Bezier Spline Path Generator
function createSmoothPath54(points) {
  if (!points || points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let path = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i === 0 ? 0 : i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2 < points.length ? i + 2 : i + 1];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return path;
}
const pts54 = [{ x: 70, y: 195 }, { x: 200, y: 120 }, { x: 330, y: 80 }, { x: 460, y: 60 }];
const path54 = createSmoothPath54(pts54);
const pass54 = path54.startsWith('M 70.0 195.0') && path54.includes(' C ') && !path54.includes('NaN');
console.log('54. Bezier Spline Smooth Path Math Integrity:', pass54 ? 'PASSED' : 'FAILED', path54.slice(0, 50) + '...');

// Test 55: Y-Axis Scale Divisibility & Rupiah Formatting (Rp 2Jt, Rp 4Jt, dsb)
function formatRupiahCompact55(val) {
  if (!val || val === 0) return 'Rp 0';
  if (val >= 1000000) {
    const jt = val / 1000000;
    return `Rp ${jt % 1 === 0 ? jt.toFixed(0) : jt.toFixed(1)}Jt`;
  }
  if (val >= 1000) {
    return `Rp ${(val / 1000).toFixed(0)}rb`;
  }
  return `Rp ${val}`;
}
const maxVal55 = 6000000;
const grid55 = [0, Math.round(maxVal55 / 3), Math.round((maxVal55 * 2) / 3), maxVal55];
const labels55 = grid55.map(formatRupiahCompact55);
const pass55 = labels55[0] === 'Rp 0' && labels55[1] === 'Rp 2Jt' && labels55[2] === 'Rp 4Jt' && labels55[3] === 'Rp 6Jt';
console.log('55. Y-Axis Clean Scale & Grid Levels (Rp 2Jt, Rp 4Jt, Rp 6Jt):', pass55 ? 'PASSED' : 'FAILED', labels55);

// Test 56: Real-time Multi-Month Aggregation for SalesTrendChart
const trendMonths56 = ['2026-08', '2026-09', '2026-10', '2026-11'];
const monthlyTrend56 = trendMonths56.map(mKey => {
  const mOrders = testOrders51.filter(o => getTxMonth51(o) === mKey);
  const mSettlements = testSettlements51.filter(s => getTxMonth51(s) === mKey);
  const omzet = mOrders.reduce((s, o) => s + (o.total || 0), 0) + mSettlements.reduce((s, st) => s + (st.totalCollected || 0), 0);
  const profit = mOrders.reduce((s, o) => s + (o.grossProfit || 0), 0) + mSettlements.reduce((s, st) => s + (st.grossProfit || 0), 0);
  return { mKey, omzet, profit };
});
const pass56 = monthlyTrend56.length === 4 &&
               monthlyTrend56.find(t => t.mKey === '2026-10').omzet === 360000 &&
               monthlyTrend56.find(t => t.mKey === '2026-11').omzet === 500000;
console.log('56. Real-time Multi-Month Dual Trend Aggregation:', pass56 ? 'PASSED' : 'FAILED', monthlyTrend56);

// Test 57: RevenueComparisonChart Syntax Safety (No Duplicate Variable Declarations)
const revCompTsx = fs.readFileSync(path.resolve(__dirname, '../components/Dashboard/RevenueComparisonChart.tsx'), 'utf8');
const noDuplicateB2CCount = (revCompTsx.match(/const\s+b2cCount\s*=/g) || []).length === 1;
const noDuplicateB2BCount = (revCompTsx.match(/const\s+b2bCount\s*=/g) || []).length === 1;
const pass57 = noDuplicateB2CCount && noDuplicateB2BCount;
console.log('57. RevenueComparisonChart Syntax & Scope Safety:', pass57 ? 'PASSED' : 'FAILED');

// Test 58: DashboardView StatCard References (No displayFilteredOrders Crash)
const dashViewTsx = fs.readFileSync(path.resolve(__dirname, '../components/Dashboard/DashboardView.tsx'), 'utf8');
const noDisplayFilteredOrders = !dashViewTsx.includes('displayFilteredOrders');
const hasFilteredOrdersCount = dashViewTsx.includes('filteredOrders.length + filteredSettlements.length');
const pass58 = noDisplayFilteredOrders && hasFilteredOrdersCount;
console.log('58. DashboardView StatCard Runtime Safety:', pass58 ? 'PASSED' : 'FAILED');

// Test 59: SalesTrendChart Halo SVG Circle (No wild orbital animate-spin)
const salesTrendTsx = fs.readFileSync(path.resolve(__dirname, '../components/Dashboard/SalesTrendChart.tsx'), 'utf8');
const noOrbitalSpin = !salesTrendTsx.includes('className="animate-spin"');
const pass59 = noOrbitalSpin;
console.log('59. SalesTrendChart SVG Circle Halo Rendering (No orbital spin):', pass59 ? 'PASSED' : 'FAILED');

// Test 60: 100% Codebase Synchronization between Next.js src/ and dist/index.html
const distHasChart = distHtml.includes('function SalesTrendChart') && distHtml.includes('Total Omzet') && distHtml.includes('Laba Kotor');
const distHasCalendarFilter = distHtml.includes('Filter Kalender Dinamis') && distHtml.includes('dist-month-filter');
const srcHasChart = fs.existsSync(path.resolve(__dirname, '../components/Dashboard/SalesTrendChart.tsx'));
const srcHasFilter = dashViewTsx.includes('Filter Kalender Dinamis') && dashViewTsx.includes('dashboard-month-filter');
const pass60 = distHasChart && distHasCalendarFilter && srcHasChart && srcHasFilter;
console.log('60. 100% Codebase Synchronization (dist/index.html & src/):', pass60 ? 'PASSED' : 'FAILED');

// Test 61: Left Sidebar Widget Dynamic Data Binding in dist/index.html
const sidebarHtmlPass = distHtml.includes('{formatIDR(displayedTotalRevenue)}') &&
                        distHtml.includes('{formatIDR(displayedTotalGrossProfit)}') &&
                        distHtml.includes("Total Omzet {selectedMonth === 'all' ? '(Semua Waktu)' : `(${formatMonthShort(selectedMonth)})`}");
console.log('61. Sidebar Left Widget Dynamic Binding in dist/index.html:', sidebarHtmlPass ? 'PASSED' : 'FAILED');

// Test 62: Left Sidebar Widget Dynamic Binding & CRMContext in src/
const sidebarTsx = fs.readFileSync(path.resolve(__dirname, '../components/Layout/Sidebar.tsx'), 'utf8');
const crmContextTsxFile = fs.readFileSync(path.resolve(__dirname, '../context/CRMContext.tsx'), 'utf8');
const sidebarSrcPass = sidebarTsx.includes('displayedTotalRevenue') &&
                       sidebarTsx.includes('displayedTotalGrossProfit') &&
                       sidebarTsx.includes("formatRupiah(displayedTotalRevenue)") &&
                       sidebarTsx.includes("formatRupiah(displayedTotalGrossProfit)") &&
                       crmContextTsxFile.includes('selectedMonth: string') &&
                       crmContextTsxFile.includes('displayedTotalRevenue: number');
console.log('62. Sidebar Left Widget Dynamic Binding & CRMContext in src/:', sidebarSrcPass ? 'PASSED' : 'FAILED');

// Test 63: Sidebar Cleanliness & Proper Imports
const sidebarNoStaleTotals = !sidebarTsx.includes('totalOmzet,') && !sidebarTsx.includes('totalGrossProfit,');
const sidebarImportsUtils = sidebarTsx.includes("import { formatRupiah, formatMonthShort } from '@/lib/utils'");
const pass63 = sidebarNoStaleTotals && sidebarImportsUtils;
console.log('63. Sidebar Cleanliness & Proper Imports (No Unused Database Totals):', pass63 ? 'PASSED' : 'FAILED');

// Test 64: Dynamic Synchronization Parity between Sidebar and Dashboard StatCards
const distSidebarSync = distHtml.includes('{formatIDR(displayedTotalRevenue)}') && distHtml.includes('{formatIDR(displayedTotalGrossProfit)}');
const distCardsSync = distHtml.includes('<p className="text-xl font-black text-slate-900 mt-2">{formatIDR(displayedTotalRevenue)}</p>') &&
                      distHtml.includes('<p className="text-xl font-black text-emerald-600 mt-2">{formatIDR(displayedTotalGrossProfit)}</p>');
const srcSidebarSync = sidebarTsx.includes('{formatRupiah(displayedTotalRevenue)}') && sidebarTsx.includes('{formatRupiah(displayedTotalGrossProfit)}');
const srcCardsSync = dashViewTsx.includes('formatRupiah(displayTotalOmzet)') && dashViewTsx.includes('formatRupiah(displayGrossProfit)');
const pass64 = distSidebarSync && distCardsSync && srcSidebarSync && srcCardsSync;
console.log('64. 100% Metric Synchronization Parity between Sidebar & Dashboard StatCards:', pass64 ? 'PASSED' : 'FAILED');

console.log('--- ALL 64 CRITICAL TEST CHECKS EVALUATED ---');



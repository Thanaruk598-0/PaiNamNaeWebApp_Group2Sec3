const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');
const { PaymentStatus, PaymentDocumentType } = require('@prisma/client');

const DOCUMENT_ROOT = path.join(__dirname, '..', '..', 'storage', 'documents');
const FONT_DIR = path.join(__dirname, '..', '..', 'fonts');
const FONT_REGULAR = path.join(FONT_DIR, 'Sarabun-Regular.ttf');
const FONT_BOLD = path.join(FONT_DIR, 'Sarabun-Bold.ttf');

// ========== Company Info ==========
const COMPANY = {
  nameTH: 'บริษัท ไปนำแหน่ จำกัด',
  nameEN: 'PaiNamNae Co., Ltd.',
  taxId: '0105559999999',
  address: '123 ถนนตัวอย่าง แขวงบางนา เขตบางนา กรุงเทพมหานคร 10260',
  tel: '02-xxx-xxxx',
  branch: 'สำนักงานใหญ่',
};

const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// ========== Generate unique document number ==========
const generateDocumentNumber = (prefix, id) => {
  const shortId = id.slice(0, 8).toUpperCase();
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `${prefix}-${datePart}-${shortId}`;
};

// ========== Thai number to text ==========
function bahtText(amount) {
  const thaiDigits = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const thaiUnits = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

  function intToThai(n) {
    if (n === 0) return 'ศูนย์';
    const str = String(n);
    const len = str.length;
    let result = '';
    for (let i = 0; i < len; i++) {
      const digit = parseInt(str[i]);
      const pos = len - i - 1;
      if (digit === 0) continue;
      if (pos === 0 && digit === 1 && len > 1) {
        result += 'เอ็ด';
      } else if (pos === 1 && digit === 2) {
        result += 'ยี่สิบ';
      } else if (pos === 1 && digit === 1) {
        result += 'สิบ';
      } else {
        result += thaiDigits[digit] + thaiUnits[pos];
      }
    }
    return result;
  }

  const parts = Number(amount).toFixed(2).split('.');
  const baht = parseInt(parts[0]);
  const satang = parseInt(parts[1]);

  let text = '';
  if (baht > 0) text += intToThai(baht) + 'บาท';
  if (satang > 0) text += intToThai(satang) + 'สตางค์';
  else text += 'ถ้วน';
  return text;
}

function formatThaiDate(date) {
  const d = new Date(date);
  const day = d.getDate();
  const months = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
  ];
  const month = months[d.getMonth()];
  const year = d.getFullYear() + 543;
  return `${day} ${month} ${year}`;
}

function formatThaiDateTime(date) {
  const d = new Date(date);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${formatThaiDate(d)} เวลา ${hh}:${mm}:${ss} น.`;
}

// ========== PDF base ==========
const createBasePdf = (filePath) => {
  ensureDirExists(path.dirname(filePath));
  const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });

  if (fs.existsSync(FONT_REGULAR)) {
    doc.registerFont('Thai', FONT_REGULAR);
    doc.registerFont('Thai-Bold', FONT_BOLD);
    doc.font('Thai');
  }

  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);
  return { doc, stream };
};

// ========== Draw horizontal line ==========
const hline = (doc, x1, x2, y, color = '#000000', width = 0.5) => {
  doc.save().strokeColor(color).lineWidth(width).moveTo(x1, y).lineTo(x2, y).stroke().restore();
};

// ========== ใบสำคัญรับเงิน (RV) ==========
const drawReceiptVoucher = (doc, payment, docNumber) => {
  const { booking, passenger, driver } = payment;
  const route = booking?.route || {};
  const amount = Number(payment.amount) || 0;
  const now = payment.verifiedAt ? new Date(payment.verifiedAt) : new Date();

  const mL = 50;
  const mR = 550;
  const pageW = mR - mL;

  // ===== HEADER =====
  doc.font('Thai-Bold').fontSize(22).fillColor('#1a3a6e')
    .text('ใบสำคัญรับเงิน', mL, 52, { width: pageW, align: 'center' });
  doc.font('Thai').fontSize(11).fillColor('#555555')
    .text('Receipt Voucher', mL, 80, { width: pageW, align: 'center' });

  // Border box
  doc.save().strokeColor('#1a3a6e').lineWidth(2)
    .rect(mL - 10, 44, pageW + 20, 50).stroke().restore();

  // ===== Company Info (Left) =====
  let y = 115;
  doc.font('Thai-Bold').fontSize(13).fillColor('#000000').text(COMPANY.nameTH, mL, y);
  doc.font('Thai').fontSize(10).fillColor('#333333')
    .text(`เลขประจำตัวผู้เสียภาษี: ${COMPANY.taxId} (${COMPANY.branch})`, mL, y + 20)
    .text(COMPANY.address, mL, y + 35)
    .text(`โทร: ${COMPANY.tel}  เว็บไซต์: ${COMPANY.website}`, mL, y + 50);

  // ===== Document Info (Right) =====
  const docX = 370;
  const docW = mR - docX;
  doc.roundedRect(docX - 5, y - 5, docW + 5, 75, 5)
    .fillColor('#f0f4ff').fill();
  doc.fillColor('#000000').font('Thai-Bold').fontSize(10)
    .text('เลขที่เอกสาร:', docX, y + 5)
    .font('Thai').text(docNumber, docX, y + 20)
    .font('Thai-Bold').text('วันที่ออกเอกสาร:', docX, y + 42)
    .font('Thai').text(formatThaiDate(now), docX, y + 57);

  // Divider
  hline(doc, mL - 10, mR + 10, y + 85, '#1a3a6e', 1.5);

  // ===== Seller & Buyer Info =====
  y += 100;
  const driverName = driver ? `${driver.firstName || ''} ${driver.lastName || ''}`.trim() : COMPANY.nameTH;
  const driverPhone = driver?.phoneNumber || '-';
  doc.font('Thai-Bold').fontSize(11).fillColor('#1a3a6e').text('ผู้รับเงิน (ผู้ขับ/ผู้ให้บริการ)', mL, y);
  doc.font('Thai').fontSize(10).fillColor('#000000')
    .text(`ชื่อ: ${driverName}`, mL + 12, y + 18)
    .text(`โทรศัพท์: ${driverPhone}`, mL + 12, y + 34);

  y += 65;
  doc.font('Thai-Bold').fontSize(11).fillColor('#1a3a6e').text('ผู้จ่ายเงิน (ผู้โดยสาร)', mL, y);
  const passengerName = `${passenger?.firstName || ''} ${passenger?.lastName || ''}`.trim() || 'ผู้โดยสาร';
  doc.font('Thai').fontSize(10).fillColor('#000000')
    .text(`ชื่อ: ${passengerName}`, mL + 12, y + 18)
    .text(`อีเมล: ${passenger?.email || '-'}`, mL + 12, y + 34);

  // ===== Table =====
  y += 70;
  hline(doc, mL - 10, mR + 10, y, '#1a3a6e', 1.5);
  y += 4;

  // Header row
  const col = { desc: mL, qty: 330, unitPrice: 400, total: 478 };
  doc.font('Thai-Bold').fontSize(10).fillColor('#ffffff');
  doc.rect(mL - 10, y, pageW + 20, 24).fillColor('#1a3a6e').fill();
  doc.fillColor('#ffffff')
    .text('รายการ / Description', col.desc, y + 7)
    .text('จำนวน', col.qty, y + 7, { width: 65, align: 'center' })
    .text('ราคา/หน่วย', col.unitPrice, y + 7, { width: 70, align: 'right' })
    .text('จำนวนเงิน', col.total, y + 7, { width: 72, align: 'right' });

  y += 28;

  // Data row
  const qty = booking?.numberOfSeats || 1;
  const pricePerSeat = route?.pricePerSeat || amount;
  const subTotal = qty * pricePerSeat;

  doc.font('Thai').fontSize(10).fillColor('#000000');
  doc.rect(mL - 10, y, pageW + 20, 24).fillColor('#f8f9fb').fill();
  doc.fillColor('#000000')
    .text(`ค่าโดยสาร: ${route?.routeSummary || 'เส้นทางเดินทาง'}`, col.desc + 4, y + 7, { width: 265 })
    .text(`${qty} ที่นั่ง`, col.qty, y + 7, { width: 65, align: 'center' })
    .text(pricePerSeat.toLocaleString('th-TH', { minimumFractionDigits: 2 }), col.unitPrice, y + 7, { width: 70, align: 'right' })
    .text(subTotal.toLocaleString('th-TH', { minimumFractionDigits: 2 }), col.total, y + 7, { width: 72, align: 'right' });

  y += 28;
  // Trip date row
  doc.font('Thai').fontSize(10).fillColor('#555555')
    .text(`  วันเดินทาง: ${formatThaiDate(route?.departureTime || now)}`, col.desc, y + 4, { width: 280 });
  if (driver) {
    doc.text(`  คนขับ: ${driver.firstName || ''} ${driver.lastName || ''}`, col.desc, y + 20, { width: 280 });
  }

  y += 38;
  hline(doc, mL - 10, mR + 10, y, '#cccccc');

  // Totals
  const totalAmount = amount;
  y += 8;
  doc.font('Thai').fontSize(10).fillColor('#000000')
    .text('รวมเงิน', col.unitPrice - 30, y, { width: 100, align: 'right' })
    .text(totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 }), col.total, y, { width: 75, align: 'right' });
  y += 18;
  doc.font('Thai').fontSize(10)
    .text('ส่วนลด', col.unitPrice - 30, y, { width: 100, align: 'right' })
    .text('0.00', col.total, y, { width: 75, align: 'right' });
  y += 4;
  hline(doc, mR - 115, mR + 10, y + 12, '#333333');
  y += 16;

  doc.rect(mL - 10, y, pageW + 20, 22).fillColor('#eef2ff').fill();
  doc.font('Thai-Bold').fontSize(11).fillColor('#1a3a6e')
    .text('รวมทั้งสิ้น', col.unitPrice - 45, y + 4, { width: 115, align: 'right' })
    .text(totalAmount.toLocaleString('th-TH', { minimumFractionDigits: 2 }), col.total, y + 4, { width: 75, align: 'right' });

  y += 30;
  hline(doc, mL - 10, mR + 10, y, '#1a3a6e', 1.5);

  // ===== Baht text =====
  y += 10;
  doc.font('Thai').fontSize(10).fillColor('#000000')
    .text('จำนวนเงิน (ตัวอักษร): ', mL, y, { continued: true })
    .font('Thai-Bold').text(bahtText(totalAmount));

  // ===== Channel =====
  y += 20;
  const channelLabel =
    payment.channel === 'CASH' ? 'เงินสด' :
      payment.channel === 'PROMPTPAY' ? 'พร้อมเพย์' : 'โอนเงินผ่านธนาคาร';
  doc.font('Thai').fontSize(10)
    .text(`ช่องทางการชำระเงิน: `, mL, y, { continued: true })
    .font('Thai-Bold').text(channelLabel);

  // ===== Signature area =====
  y += 55;
  doc.font('Thai').fontSize(10).fillColor('#000000');
  // Left sig (ผู้รับเงิน = คนขับ)
  hline(doc, 80, 230, y, '#333333');
  doc.text('ลงชื่อผู้รับเงิน', 80, y + 5, { width: 150, align: 'center' });
  doc.text(`(${driverName})`, 80, y + 18, { width: 150, align: 'center' });
  // Right sig (ผู้จ่ายเงิน = ผู้โดยสาร)
  hline(doc, 360, 520, y, '#333333');
  doc.text('ลงชื่อผู้จ่ายเงิน', 360, y + 5, { width: 160, align: 'center' });
  doc.text(`(${passengerName})`, 360, y + 18, { width: 160, align: 'center' });

  // ===== Footer =====
  y += 60;
  hline(doc, mL - 10, mR + 10, y, '#cccccc');
  doc.font('Thai').fontSize(8).fillColor('#888888')
    .text('เอกสารนี้ออกโดยระบบอัตโนมัติ — ไปนำแหน่ เว็บแอปพลิเคชัน | ขอบคุณที่ใช้บริการ', mL, y + 6, {
      width: pageW, align: 'center',
    });
};

// ========== ใบกำกับภาษีแบบย่อ (STI) ==========
const drawShortTaxInvoice = (doc, payment, docNumber) => {
  const { booking, driver } = payment;
  const route = booking?.route || {};
  const amount = Number(payment.amount) || 0;
  const now = payment.verifiedAt ? new Date(payment.verifiedAt) : new Date();

  // Slip-style layout
  const slipW = 330;
  const slipX = (595.28 - slipW) / 2;
  const mL = slipX + 15;
  const mR = slipX + slipW - 15;
  const contentW = mR - mL;

  // Shadow / border
  doc.save()
    .strokeColor('#cccccc').lineWidth(0.5)
    .rect(slipX - 2, 38, slipW + 4, 720).stroke()
    .restore();
  doc.rect(slipX, 40, slipW, 718).fillColor('#ffffff').fill();

  let y = 55;

  // ===== Header =====
  doc.font('Thai-Bold').fontSize(13).fillColor('#1a3a6e')
    .text(COMPANY.nameTH, mL, y, { width: contentW, align: 'center' });
  y += 18;
  doc.font('Thai').fontSize(9).fillColor('#333333')
    .text(COMPANY.address, mL, y, { width: contentW, align: 'center' });
  y += 12;
  doc.text(`โทร: ${COMPANY.tel}`, mL, y, { width: contentW, align: 'center' });
  y += 12;
  doc.text(`เลขประจำตัวผู้เสียภาษี: ${COMPANY.taxId} (${COMPANY.branch})`, mL, y, { width: contentW, align: 'center' });
  y += 12;
  doc.fillColor('#1a4aaa').text(COMPANY.website, mL, y, { width: contentW, align: 'center' });
  y += 5;

  // Title
  doc.fillColor('#ffffff');
  doc.rect(slipX, y + 5, slipW, 22).fillColor('#1a3a6e').fill();
  y += 7;
  doc.font('Thai-Bold').fontSize(11).fillColor('#ffffff')
    .text('ใบเสร็จรับเงิน / ใบกำกับภาษีแบบย่อ', mL, y + 4, { width: contentW, align: 'center' });
  y += 28;

  // ===== Doc info =====
  doc.font('Thai').fontSize(9).fillColor('#000000')
    .text(`เลขที่เอกสาร: ${docNumber}`, mL, y);
  y += 13;
  doc.text(`วันที่ขาย: ${formatThaiDateTime(now)}`, mL, y);
  y += 13;
  doc.text(`ผู้ขาย: ระบบ ไปนำแหน่`, mL, y);
  y += 6;

  hline(doc, mL, mR, y + 7, '#333333', 0.5);
  y += 16;

  // ===== Customer =====
  const passengerName = `${payment.passenger?.firstName || ''} ${payment.passenger?.lastName || ''}`.trim() || 'ผู้โดยสาร';
  doc.font('Thai').fontSize(9)
    .text(`ลูกค้า: ${passengerName}`, mL, y);
  if (payment.passenger?.email) {
    y += 12;
    doc.text(`อีเมล: ${payment.passenger.email}`, mL, y);
  }
  y += 6;
  hline(doc, mL, mR, y + 7, '#aaaaaa', 0.5);
  y += 16;

  // ===== Items header =====
  const c1 = mL;
  const c2 = mL + 138;
  const c3 = mR - 65;
  doc.font('Thai-Bold').fontSize(9).fillColor('#444444')
    .text('รายการ', c1, y, { width: 130 })
    .text('หน่วยละ', c2, y, { width: 65, align: 'right' })
    .text('รวมเงิน', c3, y, { width: 65, align: 'right' });
  y += 13;
  hline(doc, mL, mR, y, '#888888', 0.5);
  y += 6;

  // Items
  const qty = booking?.numberOfSeats || 1;
  const pricePerSeat = route?.pricePerSeat != null ? route.pricePerSeat : amount;
  const lineTotal = qty * pricePerSeat;

  doc.font('Thai').fontSize(9).fillColor('#000000');
  // Main item line
  doc.text(`${qty}x ค่าโดยสาร`, c1, y, { width: 100 })
    .text(pricePerSeat.toFixed(2), c2, y, { width: 65, align: 'right' })
    .text(lineTotal.toFixed(2), c3, y, { width: 65, align: 'right' });
  y += 13;
  // Route detail
  doc.fillColor('#666666').fontSize(8)
    .text(`  เส้นทาง: ${route?.routeSummary || '-'}`, c1, y, { width: 185 });
  y += 11;
  doc.text(`  วันเดินทาง: ${formatThaiDate(route?.departureTime || now)}`, c1, y, { width: 185 });
  y += 11;
  if (driver) {
    doc.text(`  คนขับ: ${driver.firstName || ''} ${driver.lastName || ''}`, c1, y, { width: 185 });
    y += 11;
  }

  y += 4;
  hline(doc, mL, mR, y, '#aaaaaa', 0.5);
  y += 8;

  // ===== Totals =====
  const totalInclVat = amount;
  const vatRate = 0.07;
  const beforeVat = totalInclVat / (1 + vatRate);
  const vatAmount = totalInclVat - beforeVat;

  doc.font('Thai').fontSize(9).fillColor('#000000');
  const lblW = 95;
  const valX = mR - 65;

  const addRow = (label, value, bold = false, bgColor = null) => {
    if (bgColor) {
      doc.rect(slipX, y - 2, slipW, 16).fillColor(bgColor).fill();
    }
    doc.fillColor('#000000');
    if (bold) doc.font('Thai-Bold'); else doc.font('Thai');
    doc.text(label, c1, y, { width: lblW })
      .text(value, valX, y, { width: 65, align: 'right' });
    y += 16;
  };

  addRow('รวมเป็นเงิน', amount.toFixed(2));
  addRow('ส่วนลด', '0.00');
  hline(doc, mL, mR, y - 6, '#aaaaaa', 0.5);
  addRow('รวมทั้งสิ้น', totalInclVat.toFixed(2), true, '#f0f4ff');

  y += 2;
  hline(doc, mL, mR, y, '#aaaaaa', 0.5);
  y += 8;

  addRow('มูลค่าสินค้าก่อน VAT', beforeVat.toFixed(2));
  addRow('ภาษีมูลค่าเพิ่ม (7%)', vatAmount.toFixed(2));
  hline(doc, mL, mR, y - 2, '#aaaaaa', 0.5);
  y += 4;

  // Payment channel
  const channelLabel =
    payment.channel === 'CASH' ? 'เงินสด' :
      payment.channel === 'PROMPTPAY' ? 'พร้อมเพย์' : 'โอนเงินผ่านธนาคาร';
  doc.font('Thai-Bold').fontSize(9)
    .text(channelLabel, c1, y)
    .text(totalInclVat.toFixed(2), valX, y, { width: 65, align: 'right' });
  y += 14;
  doc.font('Thai')
    .text('เงินทอน', c1, y)
    .text('0.00', valX, y, { width: 65, align: 'right' });
  y += 6;

  hline(doc, mL, mR, y + 4, '#333333', 0.5);
  y += 16;

  // ===== Baht text =====
  doc.font('Thai').fontSize(8).fillColor('#333333')
    .text(`(${bahtText(totalInclVat)})`, mL, y, { width: contentW, align: 'center' });
  y += 18;

  // ===== Thank you =====
  hline(doc, slipX, slipX + slipW, y, '#cccccc', 0.5);
  y += 10;
  doc.font('Thai-Bold').fontSize(10).fillColor('#1a3a6e')
    .text('ขอบคุณที่ใช้บริการ ไปนำแหน่', mL, y, { width: contentW, align: 'center' });
  y += 14;
  doc.font('Thai').fontSize(8).fillColor('#888888')
    .text('เอกสารนี้ออกโดยระบบอัตโนมัติ ไม่ต้องมีลายเซ็นต์', mL, y, { width: contentW, align: 'center' });
};

// ========== Generate Receipt Voucher ==========
const generateReceiptVoucher = async (payment) => {
  const dir = path.join(DOCUMENT_ROOT, payment.id);
  ensureDirExists(dir);
  const filePath = path.join(dir, 'receipt-voucher.pdf');

  const documentNumber = generateDocumentNumber('RV', payment.id);
  const { doc, stream } = createBasePdf(filePath);
  drawReceiptVoucher(doc, payment, documentNumber);
  doc.end();

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  const record = await prisma.paymentDocument.create({
    data: {
      paymentId: payment.id,
      type: PaymentDocumentType.RECEIPT_VOUCHER,
      documentNumber,
      filePath,
    },
  });

  return record;
};

// ========== Generate Short Tax Invoice ==========
const generateShortTaxInvoice = async (payment) => {
  const dir = path.join(DOCUMENT_ROOT, payment.id);
  ensureDirExists(dir);
  const filePath = path.join(dir, 'short-tax-invoice.pdf');

  const documentNumber = generateDocumentNumber('TI', payment.id);
  const { doc, stream } = createBasePdf(filePath);
  drawShortTaxInvoice(doc, payment, documentNumber);
  doc.end();

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  const record = await prisma.paymentDocument.create({
    data: {
      paymentId: payment.id,
      type: PaymentDocumentType.SHORT_TAX_INVOICE,
      documentNumber,
      filePath,
    },
  });

  return record;
};

// ========== Ensure documents exist ==========
const ensureDocumentsForPayment = async (paymentId) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: { include: { route: true } },
      passenger: true,
      driver: true,
      documents: true,
    },
  });

  if (!payment) throw new ApiError(404, 'Payment not found');
  if (payment.status !== PaymentStatus.PAID) {
    throw new ApiError(400, 'Documents can only be generated for paid payments');
  }

  const existingTypes = new Set(payment.documents.map((d) => d.type));
  const results = [];

  if (!existingTypes.has(PaymentDocumentType.RECEIPT_VOUCHER)) {
    results.push(await generateReceiptVoucher(payment));
  }
  if (!existingTypes.has(PaymentDocumentType.SHORT_TAX_INVOICE)) {
    results.push(await generateShortTaxInvoice(payment));
  }

  return results;
};

// ========== Regenerate documents (force) ==========
const regenerateDocuments = async (paymentId, userId) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: { include: { route: true } },
      passenger: true,
      driver: true,
      documents: true,
    },
  });

  if (!payment) throw new ApiError(404, 'Payment not found');
  if (payment.passengerId !== userId && payment.driverId !== userId) {
    throw new ApiError(403, 'Forbidden');
  }
  if (payment.status !== PaymentStatus.PAID) {
    throw new ApiError(400, 'Documents can only be generated for paid payments');
  }

  // Delete old DB records and files
  for (const doc of payment.documents) {
    try {
      if (fs.existsSync(doc.filePath)) fs.unlinkSync(doc.filePath);
    } catch (_) {}
    await prisma.paymentDocument.delete({ where: { id: doc.id } });
  }

  // Regenerate
  const results = [];
  results.push(await generateReceiptVoucher(payment));
  results.push(await generateShortTaxInvoice(payment));
  return results;
};

// ========== Load payment for user (auth check) ==========
const loadPaymentForUser = async (paymentId, userId) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: { include: { route: true, passenger: true } },
      passenger: true,
      driver: true,
      documents: true,
    },
  });

  if (!payment) throw new ApiError(404, 'Payment not found');
  if (payment.passengerId !== userId && payment.driverId !== userId) {
    throw new ApiError(403, 'Forbidden');
  }
  return payment;
};

const getPaymentDocumentsForUser = async (paymentId, userId) => {
  const payment = await loadPaymentForUser(paymentId, userId);
  return payment.documents;
};

// ========== Stream document ==========
const streamDocument = async (paymentId, userId, type, res, inline = true) => {
  const payment = await loadPaymentForUser(paymentId, userId);

  // Auto-generate if missing and payment is PAID
  if (payment.status === PaymentStatus.PAID) {
    const exists = payment.documents.find((d) => d.type === type);
    if (!exists) {
      await ensureDocumentsForPayment(paymentId);
      // Reload
      const fresh = await prisma.payment.findUnique({
        where: { id: paymentId },
        include: { documents: true },
      });
      payment.documents = fresh.documents;
    }
  }

  const docRecord = payment.documents.find((d) => d.type === type);
  if (!docRecord) throw new ApiError(404, 'Document not found for this payment');
  if (!fs.existsSync(docRecord.filePath)) throw new ApiError(404, 'Document file not found on server');

  const disposition = inline ? 'inline' : 'attachment';
  const filenameMap = {
    RECEIPT_VOUCHER: 'receipt-voucher.pdf',
    SHORT_TAX_INVOICE: 'short-tax-invoice.pdf',
  };
  const filename = filenameMap[type] || 'document.pdf';

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `${disposition}; filename="${filename}"`);

  const fileStream = fs.createReadStream(docRecord.filePath);
  fileStream.pipe(res);
};

const streamReceiptVoucher = async (paymentId, userId, res) => {
  await streamDocument(paymentId, userId, PaymentDocumentType.RECEIPT_VOUCHER, res, true);
};

const streamShortTaxInvoice = async (paymentId, userId, res) => {
  await streamDocument(paymentId, userId, PaymentDocumentType.SHORT_TAX_INVOICE, res, true);
};

module.exports = {
  ensureDocumentsForPayment,
  regenerateDocuments,
  getPaymentDocumentsForUser,
  streamReceiptVoucher,
  streamShortTaxInvoice,
};

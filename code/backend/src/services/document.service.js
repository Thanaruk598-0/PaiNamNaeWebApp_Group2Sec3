const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');
const { PaymentStatus, PaymentDocumentType } = require('@prisma/client');

const DOCUMENT_ROOT = path.join(__dirname, '..', '..', 'storage', 'documents');

const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const loadPaymentForUser = async (paymentId, userId) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: {
        include: { route: true, passenger: true },
      },
      passenger: true,
      driver: true,
      documents: true,
    },
  });

  if (!payment) {
    throw new ApiError(404, 'Payment not found');
  }

  if (payment.passengerId !== userId && payment.driverId !== userId) {
    throw new ApiError(403, 'Forbidden');
  }

  return payment;
};

const generateDocumentNumber = (prefix, id) => {
  const shortId = id.slice(0, 8).toUpperCase();
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  return `${prefix}-${datePart}-${shortId}`;
};

const createBasePdf = (filePath) => {
  ensureDirExists(path.dirname(filePath));
  const doc = new PDFDocument({ size: 'A4', margin: 50 });
  const stream = fs.createWriteStream(filePath);
  doc.pipe(stream);
  return { doc, stream };
};

const drawShortTaxInvoice = (doc, payment) => {
  const { booking, passenger, driver } = payment;
  const route = booking.route;

  doc.fontSize(18).text('ใบกำกับภาษีอย่างย่อ', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).text('ผู้ขาย/ผู้ให้บริการ:', { continued: true }).text(' PaiNamNae Co., Ltd.');
  doc.text('ที่อยู่: 123 Example Road, Bangkok 10200');
  doc.text('เลขประจำตัวผู้เสียภาษี: 0105559999999');
  doc.moveDown();

  doc.text('ผู้ซื้อ/ผู้รับบริการ:', { continued: true }).text(` ${passenger.firstName || ''} ${passenger.lastName || ''}`);
  doc.text(`อีเมล: ${passenger.email || '-'}`);
  doc.moveDown();

  doc.text(`เลขที่อ้างอิงการชำระเงิน: ${payment.id}`);
  doc.text(`วันที่ออกเอกสาร: ${new Date().toLocaleString('th-TH')}`);
  doc.moveDown();

  doc.text('รายการสินค้า/บริการ');
  doc.moveDown(0.5);

  const tableTop = doc.y;
  const col1 = 50;
  const col2 = 260;
  const col3 = 380;

  doc.text('รายละเอียด', col1, tableTop);
  doc.text('จำนวน', col2, tableTop);
  doc.text('จำนวนเงิน (บาท)', col3, tableTop);
  doc.moveDown();

  const detail = `เดินทางจาก ${route.routeSummary || 'เส้นทางเดินทาง'} วันที่ ${new Date(
    route.departureTime
  ).toLocaleDateString('th-TH')} คนขับ ${driver.firstName || ''} ${driver.lastName || ''}`;

  doc.text(detail, col1);
  doc.text(`${booking.numberOfSeats} ที่นั่ง`, col2);
  doc.text(payment.amount.toFixed(2), col3);

  doc.moveDown(2);

  doc.text(`รวมทั้งสิ้น (รวมภาษีมูลค่าเพิ่มแล้ว): ${payment.amount.toFixed(2)} บาท`, {
    align: 'right',
  });

  doc.moveDown(2);
  doc.text('ขอบคุณที่ใช้บริการ PaiNamNae', { align: 'center' });
};

const drawReceiptVoucher = (doc, payment) => {
  const { booking, passenger } = payment;

  doc.fontSize(18).text('ใบสำคัญรับเงิน', { align: 'center' });
  doc.moveDown();

  doc.fontSize(12).text(`เลขที่เอกสาร: ${payment.id}`);
  doc.text(`วันที่ออกเอกสาร: ${new Date().toLocaleString('th-TH')}`);
  doc.moveDown();

  doc.text(`ผู้ชำระเงิน: ${passenger.firstName || ''} ${passenger.lastName || ''}`);
  doc.text(`อีเมล: ${passenger.email || '-'}`);
  doc.moveDown();

  doc.text(
    `ได้รับเงินจำนวน ${payment.amount.toFixed(
      2
    )} บาท สำหรับค่าโดยสารจากการจองหมายเลข ${booking.id}`,
    { align: 'left' }
  );
  doc.moveDown(2);

  doc.text('สรุปรายการ', { underline: true });
  doc.moveDown(0.5);

  doc.text(`- ค่าโดยสารรวม: ${payment.amount.toFixed(2)} บาท`);
  doc.moveDown(2);

  const sigY = doc.y;
  doc.text('ผู้รับเงิน', 60, sigY + 40, { align: 'center' });
  doc.text('__________________________', 60, sigY + 20, { align: 'center' });
};

const generateReceiptVoucher = async (payment) => {
  const dir = path.join(DOCUMENT_ROOT, payment.id);
  ensureDirExists(dir);
  const filePath = path.join(dir, 'receipt-voucher.pdf');

  const { doc, stream } = createBasePdf(filePath);
  drawReceiptVoucher(doc, payment);
  doc.end();

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  const documentNumber = generateDocumentNumber('RV', payment.id);

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

const generateShortTaxInvoice = async (payment) => {
  const dir = path.join(DOCUMENT_ROOT, payment.id);
  ensureDirExists(dir);
  const filePath = path.join(dir, 'short-tax-invoice.pdf');

  const { doc, stream } = createBasePdf(filePath);
  drawShortTaxInvoice(doc, payment);
  doc.end();

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  const documentNumber = generateDocumentNumber('TI', payment.id);

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

const ensureDocumentsForPayment = async (paymentId) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: {
        include: { route: true },
      },
      passenger: true,
      driver: true,
      documents: true,
    },
  });

  if (!payment) {
    throw new ApiError(404, 'Payment not found');
  }

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

const getPaymentDocumentsForUser = async (paymentId, userId) => {
  const payment = await loadPaymentForUser(paymentId, userId);
  return payment.documents;
};

const streamDocument = async (paymentId, userId, type, res) => {
  const payment = await loadPaymentForUser(paymentId, userId);

  const docRecord = payment.documents.find((d) => d.type === type);
  if (!docRecord) {
    throw new ApiError(404, 'Document not found for this payment');
  }

  if (!fs.existsSync(docRecord.filePath)) {
    throw new ApiError(404, 'Document file not found on server');
  }

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename="document.pdf"');

  const stream = fs.createReadStream(docRecord.filePath);
  stream.pipe(res);
};

const streamReceiptVoucher = async (paymentId, userId, res) => {
  await streamDocument(paymentId, userId, PaymentDocumentType.RECEIPT_VOUCHER, res);
};

const streamShortTaxInvoice = async (paymentId, userId, res) => {
  await streamDocument(paymentId, userId, PaymentDocumentType.SHORT_TAX_INVOICE, res);
};

module.exports = {
  ensureDocumentsForPayment,
  getPaymentDocumentsForUser,
  streamReceiptVoucher,
  streamShortTaxInvoice,
};


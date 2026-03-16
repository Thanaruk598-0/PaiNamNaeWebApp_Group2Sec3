/**
 * Seed script: สร้าง Payment ที่ชำระเงินแล้ว (PAID) พร้อมสร้างเอกสาร
 * ใบสำคัญรับเงิน + ใบกำกับภาษีอย่างย่อ
 * 
 * Usage: node seed-paid-payment.js
 * 
 * ต้อง run หลัง seed-test-data.js (ต้องมี user01, driver01, booking CONFIRMED อยู่แล้ว)
 */

require('dotenv').config();
const { PrismaClient, PaymentStatus, PaymentChannel } = require('@prisma/client');
const prisma = new PrismaClient();
const documentService = require('./src/services/document.service');

// ===== Main seed logic =====
async function main() {
  console.log('🌱 Seeding Paid Payment data...\n');

  // 1. หา Passenger (user01)
  const passenger = await prisma.user.findUnique({
    where: { email: 'user01@test.com' },
  });
  if (!passenger) {
    throw new Error('❌ ไม่พบ Passenger (user01@test.com) - กรุณา run seed-test-data.js ก่อน');
  }
  console.log(`✅ Found Passenger: ${passenger.firstName} ${passenger.lastName} (${passenger.email})`);

  // 2. หา Driver (driver01)
  const driver = await prisma.user.findUnique({
    where: { email: 'driver01@test.com' },
  });
  if (!driver) {
    throw new Error('❌ ไม่พบ Driver (driver01@test.com) - กรุณา run seed-test-data.js ก่อน');
  }
  console.log(`✅ Found Driver: ${driver.firstName} ${driver.lastName} (${driver.email})`);

  // 3. หา Booking ที่ CONFIRMED ของ Passenger
  const confirmedBooking = await prisma.booking.findFirst({
    where: {
      passengerId: passenger.id,
      status: 'CONFIRMED',
    },
    include: {
      route: true,
    },
  });

  if (!confirmedBooking) {
    throw new Error('❌ ไม่มี Booking ที่ CONFIRMED - กรุณา run seed-test-data.js ก่อนหรือยืนยัน booking ผ่าน UI');
  }
  console.log(`✅ Found CONFIRMED Booking: ${confirmedBooking.id}`);
  console.log(`   Route: ${confirmedBooking.route.routeSummary || 'N/A'}`);
  console.log(`   Seats: ${confirmedBooking.numberOfSeats}, Price/Seat: ${confirmedBooking.route.pricePerSeat}`);

  const totalAmount = confirmedBooking.numberOfSeats * confirmedBooking.route.pricePerSeat;

  // 4. สร้าง Payment (status = PAID)
  let payment = await prisma.payment.findUnique({
    where: { bookingId: confirmedBooking.id },
  });

  if (payment) {
    // ถ้ามีอยู่แล้ว อัปเดตให้เป็น PAID
    payment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.PAID,
        channel: PaymentChannel.CASH,
        amount: totalAmount,
        declaredAt: new Date(),
        verifiedAt: new Date(),
        slipImageUrl: null,
      },
    });
    console.log(`✅ Payment อัปเดตเป็น PAID: ${payment.id}`);
  } else {
    payment = await prisma.payment.create({
      data: {
        bookingId: confirmedBooking.id,
        passengerId: passenger.id,
        driverId: driver.id,
        amount: totalAmount,
        status: PaymentStatus.PAID,
        channel: PaymentChannel.CASH,
        slipImageUrl: null,
        declaredAt: new Date(),
        verifiedAt: new Date(),
      },
    });
    console.log(`✅ Payment สร้างใหม่ (PAID): ${payment.id}`);
  }
  console.log(`   Amount: ${totalAmount} บาท`);

  // 5. สร้างเอกสาร (ใบสำคัญรับเงิน + ใบกำกับภาษีอย่างย่อ)
  // ลบเอกสารเก่าก่อน (ถ้ามี) เพื่อสร้างใหม่
  const existingDocs = await prisma.paymentDocument.findMany({
    where: { paymentId: payment.id }
  });
  
  if (existingDocs.length > 0) {
    const fs = require('fs');
    for (const doc of existingDocs) {
      if (fs.existsSync(doc.filePath)) {
        fs.unlinkSync(doc.filePath);
      }
      await prisma.paymentDocument.delete({ where: { id: doc.id } });
    }
    console.log(`🗑️  ลบเอกสารเก่า ${existingDocs.length} ฉบับ`);
  }

  // เรียกใช้ documentService เพื่อสร้าง PDF ตาม Layout ใหม่
  console.log('📄 กำลังสร้างเอกสารใหม่...');
  const docs = await documentService.ensureDocumentsForPayment(payment.id);
  
  const receiptDoc = docs.find(d => d.type === 'RECEIPT_VOUCHER');
  const taxDoc = docs.find(d => d.type === 'SHORT_TAX_INVOICE');

  if (receiptDoc) {
    console.log(`✅ ใบสำคัญรับเงิน: ${receiptDoc.documentNumber}`);
    console.log(`   File: ${receiptDoc.filePath}`);
  }
  if (taxDoc) {
    console.log(`✅ ใบกำกับภาษีอย่างย่อ: ${taxDoc.documentNumber}`);
    console.log(`   File: ${taxDoc.filePath}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 Seed สำเร็จ! ข้อมูลการชำระเงินพร้อมเอกสาร (ฟอนต์ไทย + โฉมใหม่):');
  console.log('='.repeat(60));
  console.log(`\n💰 Payment ID: ${payment.id}`);
  console.log(`   Status: PAID`);
  console.log(`   Amount: ${totalAmount} บาท`);
  console.log(`   Channel: CASH (เงินสด)`);
  console.log(`\n📄 เอกสาร:`);
  if (receiptDoc) console.log(`   1. ใบสำคัญรับเงิน (${receiptDoc.documentNumber})`);
  if (taxDoc) console.log(`   2. ใบกำกับภาษีอย่างย่อ (${taxDoc.documentNumber})`);
  console.log(`\n🔑 เข้าใช้งานด้วย Passenger:`);
  console.log(`   Username: user01`);
  console.log(`   Password: 12345678`);
  console.log(`\n📌 ไปที่หน้า "การเดินทางของฉัน" → แท็บ "ชำระเงินแล้ว/รอดำเนินการ"`);
  console.log(`   จะเห็นปุ่ม "เอกสาร" ลองคลิกดูได้เลย`);
  console.log('='.repeat(60));
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

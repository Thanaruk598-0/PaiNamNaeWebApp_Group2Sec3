/**
 * Seed script: สร้างข้อมูลหลายๆ รายการพร้อมเอกสาร
 * สร้าง Users, Vehicles, Routes, Bookings, Payments ครบทุก channel
 *
 * Usage: node seed-many-payments.js
 */

require('dotenv').config();
const { PrismaClient, PaymentStatus, PaymentChannel, BookingStatus, RouteStatus, Role } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
const documentService = require('./src/services/document.service');

// ===== Seed Data =====
const PASSENGERS = [
  { username: 'pax_somchai',  email: 'somchai@test.com',  firstName: 'สมชาย',  lastName: 'ใจดี',      phone: '0811111111' },
  { username: 'pax_wanna',    email: 'wanna@test.com',    firstName: 'วรรณา',  lastName: 'สุขใจ',     phone: '0822222222' },
  { username: 'pax_anucha',   email: 'anucha@test.com',   firstName: 'อนุชา',  lastName: 'รักเดินทาง', phone: '0833333333' },
  { username: 'pax_malee',    email: 'malee@test.com',    firstName: 'มาลี',   lastName: 'ดีจริง',    phone: '0844444444' },
  { username: 'pax_suphan',   email: 'suphan@test.com',   firstName: 'สุพรรณ', lastName: 'งามเนตร',   phone: '0855555555' },
];

const DRIVERS = [
  { username: 'drv_narong',   email: 'narong@test.com',   firstName: 'ณรงค์',  lastName: 'ขยันขับ',   phone: '0866666666' },
  { username: 'drv_siriporn', email: 'siriporn@test.com', firstName: 'ศิริพร', lastName: 'ขับดี',     phone: '0877777777' },
];

const ROUTES_DATA = [
  { from: 'มหาวิทยาลัยขอนแก่น',  fromLat: 16.4419, fromLng: 102.8358, to: 'สนามบินขอนแก่น',      toLat: 16.4667, toLng: 102.7891, price: 80,  seats: 4 },
  { from: 'ห้าแยกอ่างแก้ว',       fromLat: 16.4281, fromLng: 102.8297, to: 'ขอนแก่นพลาซ่า',       toLat: 16.4345, toLng: 102.8357, price: 50,  seats: 3 },
  { from: 'บิ๊กซี ขอนแก่น',       fromLat: 16.4350, fromLng: 102.8383, to: 'ตลาดสีฐาน',            toLat: 16.4255, toLng: 102.8287, price: 60,  seats: 4 },
  { from: 'KKU ประตู 3',           fromLat: 16.4401, fromLng: 102.8212, to: 'เซ็นทรัล ขอนแก่น',    toLat: 16.4337, toLng: 102.8360, price: 70,  seats: 2 },
  { from: 'โรงพยาบาลศรีนครินทร์', fromLat: 16.4476, fromLng: 102.8296, to: 'บขส. ขอนแก่น',        toLat: 16.4312, toLng: 102.8315, price: 90,  seats: 3 },
  { from: 'มข. สระว่ายน้ำ',        fromLat: 16.4445, fromLng: 102.8230, to: 'ห้างสรรพสินค้าแฟรี่', toLat: 16.4390, toLng: 102.8400, price: 120, seats: 4 },
];

// Channel ที่จะสลับกันใช้
const CHANNELS = [
  PaymentChannel.CASH,
  PaymentChannel.BANK_TRANSFER,
  PaymentChannel.CASH,
  PaymentChannel.PROMPTPAY,
  PaymentChannel.CASH,
];

// ===== Helpers =====
async function upsertUser(data, role) {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) return existing;
  return prisma.user.create({
    data: {
      username: data.username,
      email: data.email,
      password: await bcrypt.hash('Test1234!', 10),
      firstName: data.firstName,
      lastName: data.lastName,
      phoneNumber: data.phone,
      role,
      isVerified: true,
      isActive: true,
    },
  });
}

async function upsertVehicle(driver, index) {
  const existing = await prisma.vehicle.findFirst({ where: { userId: driver.id } });
  if (existing) return existing;
  const plates = ['ขก 1234', 'ขก 5678', 'ขก 9012'];
  return prisma.vehicle.create({
    data: {
      userId: driver.id,
      vehicleModel: index % 2 === 0 ? 'Toyota Yaris' : 'Honda Jazz',
      licensePlate: `${plates[index % plates.length]} (${driver.username})`.slice(0, 20),
      vehicleType: 'รถเก๋ง',
      color: index % 2 === 0 ? 'ขาว' : 'เงิน',
      seatCapacity: 4,
      amenities: [],
      isDefault: true,
    },
  });
}

async function createRoute(driver, vehicle, routeData, driverIndex) {
  const now = new Date();
  const daysAhead = 1 + (driverIndex * 2); // กระจายวัน
  const departureTime = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  departureTime.setHours(8 + driverIndex * 2, 0, 0, 0);

  return prisma.route.create({
    data: {
      driverId: driver.id,
      vehicleId: vehicle.id,
      startLocation: { name: routeData.from, lat: routeData.fromLat, lng: routeData.fromLng },
      endLocation:   { name: routeData.to,   lat: routeData.toLat,   lng: routeData.toLng   },
      routeSummary: `${routeData.from} → ${routeData.to}`,
      departureTime,
      availableSeats: routeData.seats,
      pricePerSeat: routeData.price,
      status: RouteStatus.AVAILABLE,
    },
  });
}

async function seedOnePayment(passenger, driver, route, seats, channel) {
  const amount = seats * route.pricePerSeat;

  // Booking: ต้องมี pickupLocation / dropoffLocation (JSON)
  let booking = await prisma.booking.findFirst({
    where: { passengerId: passenger.id, routeId: route.id },
  });

  const bookingData = {
    numberOfSeats: seats,
    status: BookingStatus.CONFIRMED,
    pickupLocation:  { name: route.startLocation?.name || 'จุดรับ',   lat: 16.44, lng: 102.83 },
    dropoffLocation: { name: route.endLocation?.name   || 'จุดส่ง',   lat: 16.46, lng: 102.80 },
  };

  if (booking) {
    booking = await prisma.booking.update({ where: { id: booking.id }, data: bookingData });
  } else {
    booking = await prisma.booking.create({
      data: { passengerId: passenger.id, routeId: route.id, ...bookingData },
    });
  }

  // Payment
  let payment = await prisma.payment.findUnique({ where: { bookingId: booking.id } });

  // ลบ docs เก่า
  if (payment) {
    const oldDocs = await prisma.paymentDocument.findMany({ where: { paymentId: payment.id } });
    const fs = require('fs');
    for (const d of oldDocs) {
      try { if (fs.existsSync(d.filePath)) fs.unlinkSync(d.filePath); } catch (_) {}
      await prisma.paymentDocument.delete({ where: { id: d.id } });
    }
    payment = await prisma.payment.update({
      where: { id: payment.id },
      data: {
        passengerId: passenger.id,
        driverId: driver.id,
        amount,
        status: PaymentStatus.PAID,
        channel,
        slipImageUrl: channel !== PaymentChannel.CASH ? 'https://via.placeholder.com/400x600?text=Slip' : null,
        declaredAt: new Date(),
        verifiedAt: new Date(),
      },
    });
  } else {
    payment = await prisma.payment.create({
      data: {
        bookingId: booking.id,
        passengerId: passenger.id,
        driverId: driver.id,
        amount,
        status: PaymentStatus.PAID,
        channel,
        slipImageUrl: channel !== PaymentChannel.CASH ? 'https://via.placeholder.com/400x600?text=Slip' : null,
        declaredAt: new Date(),
        verifiedAt: new Date(),
      },
    });
  }

  // Generate PDFs
  const docs = await documentService.ensureDocumentsForPayment(payment.id);
  return { payment, booking, docs };
}

// ===== Main =====
async function main() {
  console.log('🌱  Seeding many payments...\n' + '='.repeat(55));

  // Users
  console.log('\n👤  Upserting passengers...');
  const passengers = [];
  for (const p of PASSENGERS) {
    const user = await upsertUser(p, Role.PASSENGER);
    passengers.push(user);
    console.log(`   ✅ ${user.firstName} ${user.lastName} (${user.email})`);
  }

  console.log('\n🚗  Upserting drivers...');
  const drivers = [];
  const vehicles = [];
  for (let i = 0; i < DRIVERS.length; i++) {
    const user = await upsertUser(DRIVERS[i], Role.DRIVER);
    const vehicle = await upsertVehicle(user, i);
    drivers.push(user);
    vehicles.push(vehicle);
    console.log(`   ✅ ${user.firstName} ${user.lastName} — ${vehicle.vehicleModel} [${vehicle.licensePlate}]`);
  }

  // Routes
  console.log('\n🗺️   Creating routes...');
  const routes = [];
  for (let i = 0; i < ROUTES_DATA.length; i++) {
    const di = i % drivers.length;
    const route = await createRoute(drivers[di], vehicles[di], ROUTES_DATA[i], i);
    routes.push({ route, driver: drivers[di] });
    console.log(`   ✅ ${ROUTES_DATA[i].from} → ${ROUTES_DATA[i].to} (${ROUTES_DATA[i].price}฿/ที่นั่ง)`);
  }

  // Payments & Docs
  console.log('\n💰  Creating payments & documents...\n' + '-'.repeat(55));
  const results = [];

  for (let i = 0; i < passengers.length; i++) {
    const passenger = passengers[i];
    const { route, driver } = routes[i % routes.length];
    const seats = (i % 2) + 1;
    const channel = CHANNELS[i % CHANNELS.length];
    const channelLabel = {
      CASH: 'เงินสด 💵',
      BANK_TRANSFER: 'โอนเงิน 🏦',
      PROMPTPAY: 'พร้อมเพย์ 📱',
    }[channel] || channel;

    process.stdout.write(`   ${i + 1}. ${passenger.firstName} ${passenger.lastName} — ${channelLabel}... `);
    try {
      const result = await seedOnePayment(passenger, driver, route, seats, channel);
      results.push(result);
      const rv = result.docs.find(d => d.type === 'RECEIPT_VOUCHER');
      const ti = result.docs.find(d => d.type === 'SHORT_TAX_INVOICE');
      console.log(`✅  ${result.payment.amount.toFixed(2)}฿`);
      if (rv) console.log(`        📄  RV: ${rv.documentNumber}`);
      if (ti) console.log(`        📄  TI: ${ti.documentNumber}`);
    } catch (e) {
      console.log(`❌  ${e.message}`);
    }
  }

  // Summary
  console.log('\n' + '='.repeat(55));
  console.log('🎉  Seed complete!\n');
  console.log('📊  Summary:');
  console.log(`   Passengers    : ${passengers.length} คน`);
  console.log(`   Drivers       : ${drivers.length} คน`);
  console.log(`   Routes        : ${routes.length} เส้นทาง`);
  console.log(`   Payments      : ${results.length} รายการ (ทั้งหมด PAID)`);
  console.log(`   Documents     : ${results.reduce((s, r) => s + r.docs.length, 0)} ฉบับ\n`);

  const channels = results.map(r => r.payment.channel);
  const cashCount = channels.filter(c => c === 'CASH').length;
  const bankCount = channels.filter(c => c === 'BANK_TRANSFER').length;
  const ppCount   = channels.filter(c => c === 'PROMPTPAY').length;
  console.log('   ช่องทางชำระ:');
  if (cashCount) console.log(`   💵 เงินสด        : ${cashCount} รายการ`);
  if (bankCount) console.log(`   🏦 โอนเงิน       : ${bankCount} รายการ`);
  if (ppCount)   console.log(`   📱 พร้อมเพย์     : ${ppCount} รายการ`);

  console.log('\n🔑  Login credentials (password: Test1234!)');
  console.log('   PASSENGERS:');
  PASSENGERS.forEach(p => console.log(`     ${p.email}`));
  console.log('   DRIVERS:');
  DRIVERS.forEach(d => console.log(`     ${d.email}`));
  console.log('='.repeat(55));
}

main()
  .catch((e) => {
    console.error('\n❌ Seed failed:', e.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

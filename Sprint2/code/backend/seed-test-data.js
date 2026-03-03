/**
 * Seed script: สร้าง test accounts + sample route/booking สำหรับทดสอบ
 * 
 * Usage: node seed-test-data.js
 * 
 * สร้าง:
 * 1. ผู้โดยสาร (Passenger): user01 / user01@test.com / 12345678
 * 2. คนขับ   (Driver):    driver01 / driver01@test.com / 12345678
 * 3. เส้นทาง + Vehicle + Booking ตัวอย่าง
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
    console.log('🌱 Seeding test data...\n');

    // 1. สร้าง Passenger
    const passengerPassword = await bcrypt.hash('12345678', SALT_ROUNDS);
    const passenger = await prisma.user.upsert({
        where: { email: 'user01@test.com' },
        update: {},
        create: {
            email: 'user01@test.com',
            username: 'user01',
            password: passengerPassword,
            firstName: 'สมชาย',
            lastName: 'ใจดี',
            role: 'PASSENGER',
            isVerified: true,
            isActive: true,
            phoneNumber: '0812345678',
        },
    });
    console.log(`✅ Passenger: ${passenger.email} (username: user01, password: 12345678)`);

    // 2. สร้าง Driver
    const driverPassword = await bcrypt.hash('12345678', SALT_ROUNDS);
    const driver = await prisma.user.upsert({
        where: { email: 'driver01@test.com' },
        update: {},
        create: {
            email: 'driver01@test.com',
            username: 'driver01',
            password: driverPassword,
            firstName: 'สมหญิง',
            lastName: 'ขับดี',
            role: 'DRIVER',
            isVerified: true,
            isActive: true,
            phoneNumber: '0898765432',
        },
    });
    console.log(`✅ Driver:    ${driver.email} (username: driver01, password: 12345678)`);

    // 3. สร้าง Driver Verification ให้ Driver
    await prisma.driverVerification.upsert({
        where: { userId: driver.id },
        update: {},
        create: {
            userId: driver.id,
            licenseNumber: 'DL-TEST-001',
            firstNameOnLicense: 'สมหญิง',
            lastNameOnLicense: 'ขับดี',
            licenseIssueDate: new Date('2024-01-01'),
            licenseExpiryDate: new Date('2029-01-01'),
            licensePhotoUrl: 'https://via.placeholder.com/300x200?text=License',
            selfiePhotoUrl: 'https://via.placeholder.com/300x200?text=Selfie',
            typeOnLicense: 'PRIVATE_CAR',
            status: 'APPROVED',
        },
    });
    console.log('✅ Driver Verification: APPROVED');

    // 4. สร้าง Vehicle
    let vehicle = await prisma.vehicle.findFirst({
        where: { userId: driver.id },
    });
    if (!vehicle) {
        vehicle = await prisma.vehicle.create({
            data: {
                userId: driver.id,
                vehicleModel: 'Toyota Yaris 2024',
                licensePlate: 'กข 1234',
                vehicleType: 'Sedan',
                color: 'ขาว',
                seatCapacity: 4,
                amenities: ['แอร์เย็น', 'USB ชาร์จ', 'เพลง'],
                photos: [],
                isDefault: true,
            },
        });
    }
    console.log(`✅ Vehicle:   ${vehicle.vehicleModel} (${vehicle.licensePlate})`);

    // 5. สร้าง Route
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);

    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    dayAfter.setHours(14, 0, 0, 0);

    let route1 = await prisma.route.findFirst({
        where: { driverId: driver.id },
        orderBy: { createdAt: 'desc' },
    });
    if (!route1) {
        route1 = await prisma.route.create({
            data: {
                driverId: driver.id,
                vehicleId: vehicle.id,
                startLocation: { name: 'มหาวิทยาลัยขอนแก่น', lat: 16.4467, lng: 102.8350, address: 'ถ.มิตรภาพ อ.เมือง จ.ขอนแก่น' },
                endLocation: { name: 'สนามบินขอนแก่น', lat: 16.4669, lng: 102.7852, address: 'ถ.มะลิวัลย์ อ.เมือง จ.ขอนแก่น' },
                departureTime: tomorrow,
                availableSeats: 3,
                pricePerSeat: 80,
                conditions: 'ขอให้มาตรงเวลา ห้ามสูบบุหรี่',
                status: 'AVAILABLE',
                routeSummary: 'มข. → สนามบินขอนแก่น',
            },
        });
    }
    console.log(`✅ Route 1:   ${route1.routeSummary || 'มข. → สนามบิน'} (${tomorrow.toLocaleDateString('th-TH')})`);

    // Route 2
    let route2 = await prisma.route.findFirst({
        where: { driverId: driver.id, departureTime: { gte: dayAfter } },
    });
    if (!route2) {
        route2 = await prisma.route.create({
            data: {
                driverId: driver.id,
                vehicleId: vehicle.id,
                startLocation: { name: 'เซ็นทรัลขอนแก่น', lat: 16.4267, lng: 102.8390, address: 'ถ.ศรีจันทร์ อ.เมือง จ.ขอนแก่น' },
                endLocation: { name: 'บขส.ขอนแก่น', lat: 16.4320, lng: 102.8280, address: 'ถ.ประชาสโมสร อ.เมือง จ.ขอนแก่น' },
                departureTime: dayAfter,
                availableSeats: 3,
                pricePerSeat: 50,
                conditions: null,
                status: 'AVAILABLE',
                routeSummary: 'เซ็นทรัล → บขส.ขอนแก่น',
            },
        });
    }
    console.log(`✅ Route 2:   ${route2.routeSummary || 'เซ็นทรัล → บขส.'} (${dayAfter.toLocaleDateString('th-TH')})`);

    // 6. สร้าง Booking (Passenger จอง Route ของ Driver)
    let booking1 = await prisma.booking.findFirst({
        where: { passengerId: passenger.id, routeId: route1.id },
    });
    if (!booking1) {
        booking1 = await prisma.booking.create({
            data: {
                routeId: route1.id,
                passengerId: passenger.id,
                numberOfSeats: 1,
                status: 'CONFIRMED',
                pickupLocation: { name: 'หน้า มข.', lat: 16.4467, lng: 102.8350 },
                dropoffLocation: { name: 'สนามบินขอนแก่น', lat: 16.4669, lng: 102.7852 },
            },
        });
        await prisma.route.update({
            where: { id: route1.id },
            data: { availableSeats: { decrement: 1 } },
        });
    }
    console.log(`✅ Booking 1: Passenger จอง Route 1 (CONFIRMED)`);

    let booking2 = await prisma.booking.findFirst({
        where: { passengerId: passenger.id, routeId: route2.id },
    });
    if (!booking2) {
        booking2 = await prisma.booking.create({
            data: {
                routeId: route2.id,
                passengerId: passenger.id,
                numberOfSeats: 2,
                status: 'PENDING',
                pickupLocation: { name: 'เซ็นทรัลขอนแก่น', lat: 16.4267, lng: 102.8390 },
                dropoffLocation: { name: 'บขส.ขอนแก่น', lat: 16.4320, lng: 102.8280 },
            },
        });
        await prisma.route.update({
            where: { id: route2.id },
            data: { availableSeats: { decrement: 2 } },
        });
    }
    console.log(`✅ Booking 2: Passenger จอง Route 2 (PENDING)`);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 Seed สำเร็จ! ใช้ข้อมูลนี้ในการทดสอบ:');
    console.log('='.repeat(60));
    console.log(`\n👤 Admin:     pooh01 / pooh@gmail.com / 12345678`);
    console.log(`👤 Passenger: user01 / user01@test.com / 12345678`);
    console.log(`🚗 Driver:    driver01 / driver01@test.com / 12345678`);
    console.log(`\n📌 Route 1: มข. → สนามบินขอนแก่น (พรุ่งนี้ 08:00)`);
    console.log(`📌 Route 2: เซ็นทรัล → บขส. (มะรืนนี้ 14:00)`);
    console.log(`🎫 Booking 1: Passenger จอง Route 1 (CONFIRMED)`);
    console.log(`🎫 Booking 2: Passenger จอง Route 2 (PENDING)`);
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

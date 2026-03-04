/**
 * สร้าง Trips เพิ่มเติมสำหรับทดสอบ
 * Usage: node seed-more-trips.js
 */
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🚗 กำลังสร้าง Trips เพิ่มเติม...\n');

    const passenger = await prisma.user.findUnique({ where: { email: 'user01@test.com' } });
    const driver = await prisma.user.findUnique({ where: { email: 'driver01@test.com' } });
    const vehicle = await prisma.vehicle.findFirst({ where: { userId: driver.id } });

    if (!passenger || !driver || !vehicle) {
        console.error('❌ ไม่พบ user/driver/vehicle กรุณารัน seed-test-data.js ก่อน');
        return;
    }

    // ===== Trip 3: กรุงเทพ → เชียงใหม่ (อีก 3 วัน) =====
    const day3 = new Date();
    day3.setDate(day3.getDate() + 3);
    day3.setHours(6, 30, 0, 0);

    const route3 = await prisma.route.create({
        data: {
            driverId: driver.id,
            vehicleId: vehicle.id,
            startLocation: { name: 'หมอชิต กรุงเทพ', lat: 13.8025, lng: 100.5536, address: 'ถ.กำแพงเพชร 2 จตุจักร กรุงเทพ' },
            endLocation: { name: 'ม.เชียงใหม่', lat: 18.8024, lng: 98.9530, address: 'ถ.สุเทพ อ.เมือง จ.เชียงใหม่' },
            departureTime: day3,
            availableSeats: 3,
            pricePerSeat: 350,
            conditions: 'เดินทางไกล พักจุดเดียว ขอตรงเวลา',
            status: 'AVAILABLE',
            routeSummary: 'หมอชิต กรุงเทพ → ม.เชียงใหม่',
        },
    });
    const booking3 = await prisma.booking.create({
        data: {
            routeId: route3.id,
            passengerId: passenger.id,
            numberOfSeats: 1,
            status: 'CONFIRMED',
            pickupLocation: { name: 'BTS หมอชิต', lat: 13.8027, lng: 100.5538 },
            dropoffLocation: { name: 'ม.เชียงใหม่', lat: 18.8024, lng: 98.9530 },
        },
    });
    await prisma.route.update({ where: { id: route3.id }, data: { availableSeats: { decrement: 1 } } });
    console.log('✅ Trip 3: หมอชิต กรุงเทพ → ม.เชียงใหม่ (CONFIRMED)');

    // ===== Trip 4: ขอนแก่น → อุดรธานี (อีก 4 วัน) =====
    const day4 = new Date();
    day4.setDate(day4.getDate() + 4);
    day4.setHours(10, 0, 0, 0);

    const route4 = await prisma.route.create({
        data: {
            driverId: driver.id,
            vehicleId: vehicle.id,
            startLocation: { name: 'เซ็นทรัลขอนแก่น', lat: 16.4267, lng: 102.8390, address: 'ถ.ศรีจันทร์ อ.เมือง จ.ขอนแก่น' },
            endLocation: { name: 'เซ็นทรัลอุดรธานี', lat: 17.4200, lng: 102.7875, address: 'ถ.ประจักษ์ อ.เมือง จ.อุดรธานี' },
            departureTime: day4,
            availableSeats: 4,
            pricePerSeat: 200,
            conditions: 'มีแอร์เย็น มี USB ชาร์จ',
            status: 'AVAILABLE',
            routeSummary: 'เซ็นทรัลขอนแก่น → เซ็นทรัลอุดรธานี',
        },
    });
    const booking4 = await prisma.booking.create({
        data: {
            routeId: route4.id,
            passengerId: passenger.id,
            numberOfSeats: 2,
            status: 'PENDING',
            pickupLocation: { name: 'เซ็นทรัลขอนแก่น', lat: 16.4267, lng: 102.8390 },
            dropoffLocation: { name: 'เซ็นทรัลอุดรธานี', lat: 17.4200, lng: 102.7875 },
        },
    });
    await prisma.route.update({ where: { id: route4.id }, data: { availableSeats: { decrement: 2 } } });
    console.log('✅ Trip 4: เซ็นทรัลขอนแก่น → เซ็นทรัลอุดรธานี (PENDING)');

    // ===== Trip 5: มข. → บึงแก่นนคร (วันนี้ เย็น) =====
    const today = new Date();
    today.setHours(17, 30, 0, 0);

    const route5 = await prisma.route.create({
        data: {
            driverId: driver.id,
            vehicleId: vehicle.id,
            startLocation: { name: 'มหาวิทยาลัยขอนแก่น', lat: 16.4467, lng: 102.8350, address: 'ถ.มิตรภาพ อ.เมือง จ.ขอนแก่น' },
            endLocation: { name: 'บึงแก่นนคร', lat: 16.4311, lng: 102.8412, address: 'ถ.กลางเมือง อ.เมือง จ.ขอนแก่น' },
            departureTime: today,
            availableSeats: 3,
            pricePerSeat: 30,
            conditions: null,
            status: 'AVAILABLE',
            routeSummary: 'มข. → บึงแก่นนคร',
        },
    });
    const booking5 = await prisma.booking.create({
        data: {
            routeId: route5.id,
            passengerId: passenger.id,
            numberOfSeats: 1,
            status: 'CONFIRMED',
            pickupLocation: { name: 'หน้า มข.', lat: 16.4467, lng: 102.8350 },
            dropoffLocation: { name: 'บึงแก่นนคร', lat: 16.4311, lng: 102.8412 },
        },
    });
    await prisma.route.update({ where: { id: route5.id }, data: { availableSeats: { decrement: 1 } } });
    console.log('✅ Trip 5: มข. → บึงแก่นนคร (CONFIRMED, วันนี้)');

    console.log('\n' + '='.repeat(60));
    console.log('🎉 สร้าง Trips เพิ่มเติมสำเร็จ!');
    console.log('='.repeat(60));
    console.log(`\nสรุป Trips ทั้งหมดของ Passenger (user01):`);
    console.log(`  🎫 Trip 1: มข. → สนามบินขอนแก่น (CONFIRMED)`);
    console.log(`  🎫 Trip 2: เซ็นทรัล → บขส.ขอนแก่น (PENDING)`);
    console.log(`  🎫 Trip 3: หมอชิต กรุงเทพ → ม.เชียงใหม่ (CONFIRMED)`);
    console.log(`  🎫 Trip 4: เซ็นทรัลขอนแก่น → เซ็นทรัลอุดรธานี (PENDING)`);
    console.log(`  🎫 Trip 5: มข. → บึงแก่นนคร (CONFIRMED, วันนี้)`);
    console.log(`\nสรุป Trips ทั้งหมดของ Driver (driver01):`);
    console.log(`  🚗 เห็น Trip ทั้ง 5 รายการ (ในฐานะคนขับ)`);
    console.log('='.repeat(60));
}

main()
    .catch((e) => {
        console.error('❌ Failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

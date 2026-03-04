/**
 * Seed script: สร้าง test data สำหรับ User Trip Report (Self-Contained)
 * 
 * Usage: node seed-reports.js
 * 
 * สร้างทั้งหมดในตัวเอง ไม่ต้องพึ่ง script อื่น:
 * 1. Users: Passenger + Driver (upsert)
 * 2. Driver Verification + Vehicle
 * 3. Routes + Bookings
 * 4. Reports 6 รายการ (ครอบคลุมทุก IncidentType / Priority / Status)
 * 5. Chat Messages ตัวอย่าง
 */

require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const SALT_ROUNDS = 10;

async function main() {
    console.log('📋 กำลังสร้าง Test Report Data (Self-Contained)...\n');

    // ===== 1. สร้าง Users =====
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
    console.log(`✅ Passenger: ${passenger.email} (user01 / 12345678)`);

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
    console.log(`✅ Driver:    ${driver.email} (driver01 / 12345678)`);

    // ===== 2. Driver Verification =====
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

    // ===== 3. Vehicle =====
    let vehicle = await prisma.vehicle.findFirst({ where: { userId: driver.id } });
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

    // ===== 4. Routes + Bookings =====
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(8, 0, 0, 0);

    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 2);
    dayAfter.setHours(14, 0, 0, 0);

    // Route 1
    let route1 = await prisma.route.findFirst({
        where: { driverId: driver.id },
        orderBy: { createdAt: 'asc' },
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
    console.log(`✅ Route 1:   ${route1.routeSummary || 'มข. → สนามบิน'}`);

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
    console.log(`✅ Route 2:   ${route2.routeSummary || 'เซ็นทรัล → บขส.'}`);

    // Booking 1
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
    }
    console.log(`✅ Booking 1: Passenger → Route 1 (CONFIRMED)`);

    // Booking 2
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
    }
    console.log(`✅ Booking 2: Passenger → Route 2 (PENDING)`);

    // ดึง Admin (มี bootstrap จาก .env)
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (admin) {
        console.log(`✅ Admin:     ${admin.email}`);
    }

    // ===== 5. Reports =====
    console.log('\n📋 กำลังสร้าง Reports...\n');

    // Report 1: คนขับรถเร็ว
    const report1 = await prisma.report.create({
        data: {
            userId: passenger.id,
            bookingId: booking1.id,
            incidentType: 'SAFETY',
            priority: 'HIGH',
            title: 'คนขับขับรถเร็วเกินกว่ากำหนด',
            description: 'คนขับขับรถด้วยความเร็วสูงมาก ประมาณ 140 กม./ชม. บนทางหลวง ทำให้รู้สึกไม่ปลอดภัยตลอดการเดินทาง มีการแซงรถอย่างไม่ปลอดภัยหลายครั้ง และไม่สวมเข็มขัดนิรภัย',
            location: {
                name: 'ทางหลวงหมายเลข 2 (มิตรภาพ)',
                lat: 16.4500,
                lng: 102.8300,
                address: 'ถ.มิตรภาพ ช่วงกม. 15-20 อ.เมือง จ.ขอนแก่น',
            },
            attachments: [
                { url: 'https://via.placeholder.com/400x300?text=Speed+Evidence+1', resourceType: 'image' },
                { url: 'https://via.placeholder.com/400x300?text=Speed+Evidence+2', resourceType: 'image' },
            ],
            status: 'PENDING',
        },
    });
    console.log(`  🔴 Report 1: ${report1.title} (SAFETY / HIGH / PENDING)`);

    // Report 2: เปลี่ยนเส้นทางไม่แจ้ง
    const report2 = await prisma.report.create({
        data: {
            userId: passenger.id,
            bookingId: booking2.id,
            incidentType: 'TRIP_ISSUE',
            priority: 'MEDIUM',
            title: 'คนขับเปลี่ยนเส้นทางโดยไม่แจ้ง',
            description: 'คนขับเปลี่ยนเส้นทางจากเดิมที่ตกลงกันไว้ ทำให้ถึงจุดหมายปลายทางช้ากว่ากำหนดประมาณ 45 นาที โดยไม่ได้แจ้งให้ผู้โดยสารทราบล่วงหน้า และไม่ยอมอธิบายเหตุผล',
            location: {
                name: 'หน้าเซ็นทรัลขอนแก่น',
                lat: 16.4267,
                lng: 102.8390,
                address: 'ถ.ศรีจันทร์ อ.เมือง จ.ขอนแก่น',
            },
            attachments: null,
            status: 'IN_PROGRESS',
            adminNote: 'กำลังติดต่อคนขับเพื่อสอบถามข้อเท็จจริง',
        },
    });
    console.log(`  🟡 Report 2: ${report2.title} (TRIP_ISSUE / MEDIUM / IN_PROGRESS)`);

    // Report 3: ผู้โดยสารประพฤติไม่เหมาะสม (คนขับแจ้ง)
    const report3 = await prisma.report.create({
        data: {
            userId: driver.id,
            bookingId: booking1.id,
            incidentType: 'BEHAVIOR',
            priority: 'MEDIUM',
            title: 'ผู้โดยสารส่งเสียงดังรบกวน',
            description: 'ผู้โดยสารพูดโทรศัพท์เสียงดังมากตลอดการเดินทาง ทั้ง ๆ ที่มีเงื่อนไขว่าขอให้เงียบ และสูบบุหรี่ไฟฟ้าในรถ แม้จะมีป้ายบอกว่าห้ามสูบบุหรี่',
            location: {
                name: 'มหาวิทยาลัยขอนแก่น',
                lat: 16.4467,
                lng: 102.8350,
                address: 'ถ.มิตรภาพ อ.เมือง จ.ขอนแก่น',
            },
            attachments: [
                { url: 'https://via.placeholder.com/400x300?text=Behavior+Evidence', resourceType: 'image' },
            ],
            status: 'RESOLVED',
            adminNote: 'ตรวจสอบแล้ว ได้ตักเตือนผู้โดยสารเรียบร้อย หากมีพฤติกรรมซ้ำจะพิจารณาระงับบัญชี',
        },
    });
    console.log(`  🟢 Report 3: ${report3.title} (BEHAVIOR / MEDIUM / RESOLVED)`);

    // Report 4: ลืมกระเป๋าในรถ
    const report4 = await prisma.report.create({
        data: {
            userId: passenger.id,
            bookingId: booking1.id,
            incidentType: 'PROPERTY',
            priority: 'HIGH',
            title: 'ลืมกระเป๋าไว้ในรถ',
            description: 'ลืมกระเป๋าเป้สีดำ (ยี่ห้อ Anello) ไว้ในรถหลังลงจากรถที่สนามบินขอนแก่น ภายในมี laptop Macbook Air, กระเป๋าสตางค์ และเอกสารสำคัญ กรุณาช่วยประสานงานกับคนขับด้วยครับ',
            location: {
                name: 'สนามบินขอนแก่น',
                lat: 16.4669,
                lng: 102.7852,
                address: 'ถ.มะลิวัลย์ อ.เมือง จ.ขอนแก่น',
            },
            attachments: [
                { url: 'https://via.placeholder.com/400x300?text=Lost+Bag+Photo', resourceType: 'image' },
            ],
            status: 'PENDING',
        },
    });
    console.log(`  🔴 Report 4: ${report4.title} (PROPERTY / HIGH / PENDING)`);

    // Report 5: GPS ผิดพลาด
    const report5 = await prisma.report.create({
        data: {
            userId: passenger.id,
            bookingId: booking2.id,
            incidentType: 'TECHNICAL',
            priority: 'LOW',
            title: 'แอปแสดงตำแหน่ง GPS ผิด',
            description: 'ขณะเดินทาง แอปแสดงตำแหน่ง GPS ผิดพลาด โดยแสดงว่าอยู่คนละจังหวัดกับตำแหน่งจริง ทำให้ไม่สามารถแชร์ตำแหน่งให้คนที่บ้านได้ ลองปิดเปิดแอปใหม่แล้วก็ยังผิด',
            location: {
                name: 'บขส.ขอนแก่น',
                lat: 16.4320,
                lng: 102.8280,
                address: 'ถ.ประชาสโมสร อ.เมือง จ.ขอนแก่น',
            },
            attachments: [
                { url: 'https://via.placeholder.com/400x300?text=GPS+Bug+Screenshot', resourceType: 'image' },
            ],
            status: 'REJECTED',
            adminNote: 'เป็นปัญหาจากสัญญาณ GPS ของอุปกรณ์ผู้ใช้ ไม่เกี่ยวข้องกับระบบแอป แนะนำให้ลองรีสตาร์ทโทรศัพท์',
        },
    });
    console.log(`  ⚪ Report 5: ${report5.title} (TECHNICAL / LOW / REJECTED)`);

    // Report 6: ผู้โดยสารคุกคาม (คนขับแจ้ง)
    const report6 = await prisma.report.create({
        data: {
            userId: driver.id,
            bookingId: booking1.id,
            incidentType: 'SAFETY',
            priority: 'CRITICAL',
            title: 'ผู้โดยสารมีพฤติกรรมคุกคาม',
            description: 'ผู้โดยสารมีพฤติกรรมข่มขู่และใช้คำพูดรุนแรง เรียกร้องให้เปลี่ยนเส้นทางไปที่ไม่มีในแผน เมื่อปฏิเสธก็ตะโกนโวยวาย และขู่ว่าจะให้คะแนนรีวิวต่ำ ทำให้รู้สึกไม่ปลอดภัยมาก',
            location: {
                name: 'ถนนมิตรภาพ ช่วงหน้า มข.',
                lat: 16.4480,
                lng: 102.8345,
                address: 'ถ.มิตรภาพ หน้ามหาวิทยาลัยขอนแก่น อ.เมือง จ.ขอนแก่น',
            },
            attachments: [
                { url: 'https://via.placeholder.com/400x300?text=Dashcam+Screenshot', resourceType: 'image' },
                { url: 'https://via.placeholder.com/400x300?text=Threat+Message', resourceType: 'image' },
            ],
            status: 'IN_PROGRESS',
            adminNote: 'เรื่องเร่งด่วน กำลังตรวจสอบหลักฐานและประสานงานกับทีมดำเนินการ',
        },
    });
    console.log(`  🔥 Report 6: ${report6.title} (SAFETY / CRITICAL / IN_PROGRESS)`);

    // ===== 6. Chat Messages =====
    console.log('\n💬 กำลังสร้าง Chat Messages...\n');

    // Chat ใน Report 1
    const chatData1 = [
        {
            reportId: report1.id,
            senderId: passenger.id,
            content: 'สวัสดีครับ ผมอยากจะแจ้งเรื่องคนขับที่ขับเร็วมากครับ รู้สึกไม่ปลอดภัยเลย',
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
            reportId: report1.id,
            senderId: passenger.id,
            content: 'มีภาพหลักฐานจากกล้องหน้ารถที่แสดงความเร็วด้วยครับ แนบมาแล้ว',
            createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        },
    ];
    if (admin) {
        chatData1.splice(1, 0, {
            reportId: report1.id,
            senderId: admin.id,
            content: 'สวัสดีครับ ขอบคุณที่แจ้งมา ทีมงานรับเรื่องแล้ว กำลังตรวจสอบข้อมูลเพิ่มเติม',
            createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000),
        });
    }
    await prisma.chatMessage.createMany({ data: chatData1 });
    console.log(`  ✅ Chat Report 1: ${chatData1.length} ข้อความ`);

    // Chat ใน Report 2
    const chatData2 = [
        {
            reportId: report2.id,
            senderId: passenger.id,
            content: 'คนขับเปลี่ยนเส้นทางทำให้ไปช้ามากเลยครับ',
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
        },
        {
            reportId: report2.id,
            senderId: passenger.id,
            content: 'ขอบคุณครับ ถ้ามีเหตุผลก็เข้าใจได้ แต่ควรแจ้งก่อนจริง ๆ ครับ',
            createdAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000),
        },
    ];
    if (admin) {
        chatData2.splice(1, 0,
            {
                reportId: report2.id,
                senderId: admin.id,
                content: 'รับทราบครับ กำลังติดต่อคนขับเพื่อสอบถามเหตุผลที่เปลี่ยนเส้นทาง',
                createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
            },
            {
                reportId: report2.id,
                senderId: admin.id,
                content: 'ติดต่อคนขับได้แล้วครับ คนขับแจ้งว่ามีอุบัติเหตุปิดถนนเดิม จึงต้องอ้อม แต่ยอมรับว่าควรจะแจ้งผู้โดยสารก่อน กำลังพิจารณาเรื่องชดเชย',
                createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
            }
        );
    }
    await prisma.chatMessage.createMany({ data: chatData2 });
    console.log(`  ✅ Chat Report 2: ${chatData2.length} ข้อความ`);

    // Chat ใน Report 6 (เรื่องเร่งด่วน)
    const chatData6 = [
        {
            reportId: report6.id,
            senderId: driver.id,
            content: 'เรื่องด่วนครับ ผู้โดยสารมีพฤติกรรมข่มขู่ ผมรู้สึกไม่ปลอดภัยมากครับ',
            createdAt: new Date(Date.now() - 30 * 60 * 1000),
        },
        {
            reportId: report6.id,
            senderId: driver.id,
            content: 'ผมมีคลิปจากกล้องหน้ารถด้วยครับ จะส่งให้ดูเพิ่มเติม',
            createdAt: new Date(Date.now() - 10 * 60 * 1000),
        },
    ];
    if (admin) {
        chatData6.splice(1, 0, {
            reportId: report6.id,
            senderId: admin.id,
            content: 'รับทราบครับ เรื่องนี้มีความสำคัญสูง ทีมงานกำลังดำเนินการตรวจสอบหลักฐานอย่างเร่งด่วน',
            createdAt: new Date(Date.now() - 20 * 60 * 1000),
        });
        chatData6.push({
            reportId: report6.id,
            senderId: admin.id,
            content: 'ขอบคุณครับ กรุณาส่งคลิปมาได้เลย จะใช้เป็นหลักฐานในการพิจารณา อาจมีการระงับบัญชีผู้โดยสารชั่วคราว',
            createdAt: new Date(Date.now() - 5 * 60 * 1000),
        });
    }
    await prisma.chatMessage.createMany({ data: chatData6 });
    console.log(`  ✅ Chat Report 6: ${chatData6.length} ข้อความ`);

    // ===== สรุป =====
    console.log('\n' + '='.repeat(70));
    console.log('🎉 สร้าง Test Report Data สำเร็จ!');
    console.log('='.repeat(70));
    console.log('\n� Accounts:');
    console.log(`  Passenger: user01@test.com (user01 / 12345678)`);
    console.log(`  Driver:    driver01@test.com (driver01 / 12345678)`);
    if (admin) console.log(`  Admin:     ${admin.email}`);
    console.log('\n📋 Reports:');
    console.log('  🔴 Report 1: คนขับขับรถเร็ว            (SAFETY / HIGH / PENDING)');
    console.log('  🟡 Report 2: เปลี่ยนเส้นทางไม่แจ้ง       (TRIP_ISSUE / MEDIUM / IN_PROGRESS)');
    console.log('  🟢 Report 3: ผู้โดยสารส่งเสียงดัง        (BEHAVIOR / MEDIUM / RESOLVED)');
    console.log('  🔴 Report 4: ลืมกระเป๋าในรถ             (PROPERTY / HIGH / PENDING)');
    console.log('  ⚪ Report 5: GPS ผิดพลาด               (TECHNICAL / LOW / REJECTED)');
    console.log('  🔥 Report 6: ผู้โดยสารคุกคาม             (SAFETY / CRITICAL / IN_PROGRESS)');
    console.log('='.repeat(70));
}

main()
    .catch((e) => {
        console.error('❌ Seed Report failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

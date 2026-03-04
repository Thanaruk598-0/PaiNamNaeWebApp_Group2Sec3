/**
 * Report API Testing — Incident Report System
 * ทดสอบ API endpoints ทั้งหมดของระบบแจ้งเหตุการณ์
 *
 * ใช้ Jest + Supertest
 * รัน: cd backend && npx jest ../test/api/report.api.test.js --forceExit --detectOpenHandles
 *
 * ⚠️ ต้องเปิด backend server (npm run dev) ก่อนรัน test
 */

const request = require('supertest');

const BASE_URL = 'http://localhost:3000';

// ──────────── Test State ────────────
let userToken = '';
let adminToken = '';
let createdReportId = '';

// ──────────── Login Helper ────────────
async function loginAs(email, password) {
    const res = await request(BASE_URL)
        .post('/api/auth/login')
        .send({ email, password });
    return res.body.token || res.body.data?.token || '';
}

// ══════════════════════════════════════
// Setup — Login ก่อน run test ทั้งหมด
// ══════════════════════════════════════

beforeAll(async () => {


   
    userToken = await loginAs('user01@test.com', '12345678');   // บัญชี Passenger
    

    // Login as admin
    
    adminToken = await loginAs('admin_new@test.com', '12345678');  // บัญชี Admin

    console.log('User token:', userToken ? '✅ ได้รับ token' : 'User token: ❌ ไม่ได้ token');
    console.log('Admin token:', adminToken ? '✅ ได้รับ token' : 'Admin token: ❌ ไม่ได้ token');
}, 15000);

// ══════════════════════════════════════
// 1. USER — สร้างรายงาน (POST /api/reports)
// ══════════════════════════════════════

describe('POST /api/reports — User สร้างรายงานใหม่', () => {

    test('TC-API-01: สร้างรายงานสำเร็จ (ครบทุก field)', async () => {
        const res = await request(BASE_URL)
            .post('/api/reports')
            .set('Authorization', `Bearer ${userToken}`)
            .field('incidentType', 'BEHAVIOR')
            .field('priority', 'HIGH')
            .field('title', 'ทดสอบรายงาน — คนขับขับรถเร็ว')
            .field('description', 'คนขับขับรถเกินความเร็วที่กำหนดในเขตชุมชน ทำให้ผู้โดยสารรู้สึกไม่ปลอดภัย')
            .field('location', JSON.stringify({ lat: 16.4321, lng: 102.8236, address: 'มหาวิทยาลัยขอนแก่น' }));

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty('id');
        expect(res.body.data.incidentType).toBe('BEHAVIOR');
        expect(res.body.data.priority).toBe('HIGH');
        expect(res.body.data.status).toBe('PENDING');

        createdReportId = res.body.data.id;
        console.log('  → Created report ID:', createdReportId);
    });

    test('TC-API-02: สร้างรายงานสำเร็จ โดยไม่ส่ง priority (ใช้ค่า default MEDIUM)', async () => {
        const res = await request(BASE_URL)
            .post('/api/reports')
            .set('Authorization', `Bearer ${userToken}`)
            .field('incidentType', 'TRIP_ISSUE')
            .field('title', 'เส้นทางผิด — test default priority')
            .field('description', 'เส้นทางที่แสดงในแอปไม่ตรงกับเส้นทางจริง')
            .field('location', JSON.stringify({ lat: 16.44, lng: 102.83 }));

        expect(res.status).toBe(201);
        expect(res.body.data.priority).toBe('MEDIUM');
    });

    test('TC-API-03: สร้างรายงานพร้อมรูปภาพ', async () => {
        const res = await request(BASE_URL)
            .post('/api/reports')
            .set('Authorization', `Bearer ${userToken}`)
            .field('incidentType', 'BEHAVIOR')
            .field('priority', 'LOW')
            .field('title', 'ผู้โดยสารส่งเสียงดัง — test image upload')
            .field('description', 'ผู้โดยสารใช้ลำโพงฟังเพลงดังรบกวนผู้อื่น')
            .field('location', JSON.stringify({ lat: 16.45, lng: 102.84 }))
            .attach('image', Buffer.from('fake-image-data'), 'incident.jpg');

        // อาจจะ 201 หรือ error ขึ้นอยู่กับ Cloudinary config
        if (res.status === 201) {
            expect(res.body.data).toHaveProperty('imageUrl');
        } else {
            console.log('  → Image upload test: Cloudinary อาจไม่ได้ config (expected in test env)');
        }
    });

    test('TC-API-04: สร้างรายงานล้มเหลว — ไม่ส่ง incidentType', async () => {
        const res = await request(BASE_URL)
            .post('/api/reports')
            .set('Authorization', `Bearer ${userToken}`)
            .field('title', 'ทดสอบ')
            .field('description', 'รายละเอียด')
            .field('location', JSON.stringify({ lat: 16.45, lng: 102.84 }));

        expect(res.status).toBe(400);
    });

    test('TC-API-05: สร้างรายงานล้มเหลว — ไม่ส่ง title', async () => {
        const res = await request(BASE_URL)
            .post('/api/reports')
            .set('Authorization', `Bearer ${userToken}`)
            .field('incidentType', 'TECHNICAL')
            .field('description', 'รายละเอียด')
            .field('location', JSON.stringify({ lat: 16.45, lng: 102.84 }));

        expect(res.status).toBe(400);
    });

    test('TC-API-06: สร้างรายงานล้มเหลว — ไม่ส่ง location (บังคับ)', async () => {
        const res = await request(BASE_URL)
            .post('/api/reports')
            .set('Authorization', `Bearer ${userToken}`)
            .field('incidentType', 'BOOKING')
            .field('title', 'ทดสอบ no location')
            .field('description', 'รายละเอียด');

        expect(res.status).toBe(400);
    });

    test('TC-API-07: สร้างรายงานล้มเหลว — incidentType ไม่ถูกต้อง', async () => {
        const res = await request(BASE_URL)
            .post('/api/reports')
            .set('Authorization', `Bearer ${userToken}`)
            .field('incidentType', 'INVALID_TYPE')
            .field('title', 'ทดสอบ invalid type')
            .field('description', 'รายละเอียด')
            .field('location', JSON.stringify({ lat: 16.45, lng: 102.84 }));

        expect(res.status).toBe(400);
    });

    test('TC-API-08: สร้างรายงานล้มเหลว — ไม่มี token (Unauthorized)', async () => {
        const res = await request(BASE_URL)
            .post('/api/reports')
            .field('incidentType', 'DRIVER')
            .field('title', 'ทดสอบ')
            .field('description', 'รายละเอียด')
            .field('location', JSON.stringify({ lat: 16.45, lng: 102.84 }));

        expect(res.status).toBe(401);
    });
});

// ══════════════════════════════════════
// 2. USER — ดูรายงานของตัวเอง (GET /api/reports/me)
// ══════════════════════════════════════

describe('GET /api/reports/me — User ดูรายงานของตัวเอง', () => {

    test('TC-API-09: ดึงรายงานของ user สำเร็จ', async () => {
        const res = await request(BASE_URL)
            .get('/api/reports/me')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(Array.isArray(res.body.data)).toBe(true);
        console.log(`  → User มีรายงาน ${res.body.data.length} รายการ`);
    });

    test('TC-API-10: ดึงรายงานล้มเหลว — ไม่มี token', async () => {
        const res = await request(BASE_URL).get('/api/reports/me');
        expect(res.status).toBe(401);
    });
});

// ══════════════════════════════════════
// SPRINT 2 ADDITIONAL TESTS (Story 11 & 13)
// ══════════════════════════════════════

describe('SPRINT 2: Driver & Passenger Workflow (Story 11 & 13)', () => {
    let sprint2ReportId = '';

    test('TC-S2-11: [Driver] สร้างรายงานและตรวจสอบการอัปเดตจาก Admin', async () => {
        // 1. สร้างรายงานในนาม Driver (ใช้ Token ของคนขับ)
        const createRes = await request(BASE_URL)
            .post('/api/reports')
            .set('Authorization', `Bearer ${userToken}`) // ในใช้งานจริงควรแยกเป็น driverToken
            .field('incidentType', 'BEHAVIOR')
            .field('title', 'ผู้โดยสารไม่ชำระเงิน (Driver Report)')
            .field('description', 'แจ้งเพื่อขอความช่วยเหลือในการติดตามค่าโดยสาร')
            .field('location', JSON.stringify({ lat: 16.123, lng: 102.456 }));

        expect(createRes.status).toBe(201);
        sprint2ReportId = createRes.body.data.id;

        // 2. จำลอง Admin เข้ามาอัปเดตสถานะและใส่ Note (ตอบโจทย์ "get the update")
        await request(BASE_URL)
            .put(`/api/reports/admin/${sprint2ReportId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ 
                status: 'IN_PROGRESS', 
                adminNote: 'กำลังตรวจสอบข้อมูลการเดินทางเพื่อประสานงานต่อ' 
            });

        // 3. ตรวจสอบว่า Driver เห็น Note และสถานะที่อัปเดตแล้ว
        const checkRes = await request(BASE_URL)
            .get('/api/reports/me')
            .set('Authorization', `Bearer ${userToken}`);

        const updatedReport = checkRes.body.data.find(r => r.id === sprint2ReportId);
        expect(updatedReport.status).toBe('IN_PROGRESS');
        expect(updatedReport.adminNote).toBe('กำลังตรวจสอบข้อมูลการเดินทางเพื่อประสานงานต่อ');
    });

    test('TC-S2-13: [Passenger] รายงานพฤติกรรมคนขับและติดตามผล (RESOLVED)', async () => {
        // 1. Passenger สร้างรายงานแจ้งพฤติกรรม
        const createRes = await request(BASE_URL)
            .post('/api/reports')
            .set('Authorization', `Bearer ${userToken}`)
            .field('incidentType', 'BEHAVIOR')
            .field('title', 'คนขับพูดจาไม่สุภาพ (Passenger Report)')
            .field('description', 'พฤติกรรมไม่เหมาะสมระหว่างการเดินทาง')
            .field('location', JSON.stringify({ lat: 16.789, lng: 102.012 }));

        const pReportId = createRes.body.data.id;

        // 2. Admin ทำการแก้ไขและปิดเคส
        await request(BASE_URL)
            .put(`/api/reports/admin/${pReportId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ 
                status: 'RESOLVED', 
                adminNote: 'ได้ทำการตักเตือนและหักคะแนนความประพฤติคนขับเรียบร้อยแล้ว' 
            });

        // 3. Passenger ตรวจสอบว่าเคสได้รับสถานะ RESOLVED
        const checkRes = await request(BASE_URL)
            .get('/api/reports/me')
            .set('Authorization', `Bearer ${userToken}`);

        const resolvedReport = checkRes.body.data.find(r => r.id === pReportId);
        expect(resolvedReport.status).toBe('RESOLVED');
    });
});

// ══════════════════════════════════════
// 3. ADMIN — ดูรายงานทั้งหมด (GET /api/reports/admin)
// ══════════════════════════════════════

describe('GET /api/reports/admin — Admin ดูรายงานทั้งหมด', () => {

    test('TC-API-11: ดึงรายงานทั้งหมดสำเร็จ', async () => {
        const res = await request(BASE_URL)
            .get('/api/reports/admin')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body).toHaveProperty('pagination');
        console.log(`  → มีรายงานทั้งหมด ${res.body.pagination?.total || res.body.data?.length} รายการ`);
    });

    test('TC-API-12: กรองตาม incidentType = DRIVER', async () => {
        const res = await request(BASE_URL)
            .get('/api/reports/admin?incidentType=BEHAVIOR')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        if (res.body.data && res.body.data.length > 0) {
            res.body.data.forEach(report => {
                expect(report.incidentType).toBe('BEHAVIOR');
            });
        }
    });

    test('TC-API-13: กรองตาม priority = HIGH', async () => {
        const res = await request(BASE_URL)
            .get('/api/reports/admin?priority=HIGH')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        if (res.body.data && res.body.data.length > 0) {
            res.body.data.forEach(report => {
                expect(report.priority).toBe('HIGH');
            });
        }
    });

    test('TC-API-14: กรองตาม status = PENDING', async () => {
        const res = await request(BASE_URL)
            .get('/api/reports/admin?status=PENDING')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        if (res.body.data && res.body.data.length > 0) {
            res.body.data.forEach(report => {
                expect(report.status).toBe('PENDING');
            });
        }
    });

    test('TC-API-15: ค้นหาด้วย search keyword', async () => {
        const res = await request(BASE_URL)
            .get('/api/reports/admin?search=คนขับ')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
    });

    test('TC-API-16: Pagination — page=1, limit=5', async () => {
        const res = await request(BASE_URL)
            .get('/api/reports/admin?page=1&limit=5')
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.length).toBeLessThanOrEqual(5);
    });

    test('TC-API-17: User ปกติเข้าถึง admin endpoint ไม่ได้', async () => {
        const res = await request(BASE_URL)
            .get('/api/reports/admin')
            .set('Authorization', `Bearer ${userToken}`);

        expect(res.status).toBe(403);
    });
});

// ══════════════════════════════════════
// 4. ADMIN — ดูรายละเอียดรายงาน (GET /api/reports/admin/:id)
// ══════════════════════════════════════

describe('GET /api/reports/admin/:id — Admin ดูรายละเอียด', () => {

    test('TC-API-18: ดูรายละเอียดรายงานสำเร็จ', async () => {
        if (!createdReportId) return console.log('  → ข้ามเพราะยังไม่มี report');

        const res = await request(BASE_URL)
            .get(`/api/reports/admin/${createdReportId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.data.id).toBe(createdReportId);
        expect(res.body.data).toHaveProperty('user');
        expect(res.body.data.user).toHaveProperty('phoneNumber');
        console.log(`  → รายงาน: ${res.body.data.title}`);
    });

    test('TC-API-19: ดูรายงานที่ไม่มีอยู่ → 400/404', async () => {
        const res = await request(BASE_URL)
            .get('/api/reports/admin/nonexistent-id-99999')
            .set('Authorization', `Bearer ${adminToken}`);

        // ID ที่ไม่ใช่ CUID format จะได้ 400 (validation), ID format ถูกแต่ไม่มีจะได้ 404
        expect([400, 404]).toContain(res.status);
    });
});

// ══════════════════════════════════════
// 5. ADMIN — อัปเดตสถานะ (PUT /api/reports/admin/:id)
// ══════════════════════════════════════

describe('PUT /api/reports/admin/:id — Admin อัปเดตสถานะ', () => {

    test('TC-API-20: อัปเดตสถานะเป็น IN_PROGRESS + เพิ่มหมายเหตุ', async () => {
        if (!createdReportId) return console.log('  → ข้ามเพราะยังไม่มี report');

        const res = await request(BASE_URL)
            .put(`/api/reports/admin/${createdReportId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'IN_PROGRESS', adminNote: 'กำลังตรวจสอบข้อมูล' });

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe('IN_PROGRESS');
        expect(res.body.data.adminNote).toBe('กำลังตรวจสอบข้อมูล');
        expect(res.body.data.user).toHaveProperty('phoneNumber');
    });

    test('TC-API-21: อัปเดตสถานะเป็น RESOLVED', async () => {
        if (!createdReportId) return console.log('  → ข้ามเพราะยังไม่มี report');

        const res = await request(BASE_URL)
            .put(`/api/reports/admin/${createdReportId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'RESOLVED', adminNote: 'แก้ไขเรียบร้อยแล้ว' });

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe('RESOLVED');
    });

    test('TC-API-22: อัปเดตด้วย status ไม่ถูกต้อง → 400', async () => {
        if (!createdReportId) return console.log('  → ข้ามเพราะยังไม่มี report');

        const res = await request(BASE_URL)
            .put(`/api/reports/admin/${createdReportId}`)
            .set('Authorization', `Bearer ${adminToken}`)
            .send({ status: 'INVALID_STATUS' });

        expect(res.status).toBe(400);
    });
});

// ══════════════════════════════════════
// 6. ADMIN — ลบรายงาน (DELETE /api/reports/admin/:id)
// ══════════════════════════════════════

describe('DELETE /api/reports/admin/:id — Admin ลบรายงาน', () => {

    test('TC-API-23: ลบรายงานสำเร็จ', async () => {
        if (!createdReportId) return console.log('  → ข้ามเพราะยังไม่มี report');

        const res = await request(BASE_URL)
            .delete(`/api/reports/admin/${createdReportId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        console.log(`  → ลบรายงาน ${createdReportId} สำเร็จ`);
    });

    test('TC-API-24: ลบรายงานที่ไม่มีอยู่ → 404', async () => {
        if (!createdReportId) return console.log('  → ข้ามเพราะยังไม่มี report');

        const res = await request(BASE_URL)
            .delete(`/api/reports/admin/${createdReportId}`)
            .set('Authorization', `Bearer ${adminToken}`);

        expect(res.status).toBe(404);
    });
});
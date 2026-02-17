Test Code — ตัวอย่างสคริปต์ทดสอบ (curl + Node)

1) Curl แบบ manual

- สร้าง Incident (ถ้ามี POST endpoint)
```bash
curl -X POST http://localhost:3000/api/incidents \
  -H "Authorization: Bearer <token_userA>" \
  -H "Content-Type: application/json" \
  -d '{
    "reporterId": "user_a",
    "type": "DRIVER",
    "priority": "HIGH",
    "title": "คนขับไม่มารับ",
    "description": "รอ 30 นาที",
    "relatedUserId": "user_b"
  }'
```

- แอดมินอัปเดตสถานะ
```bash
curl -X PATCH http://localhost:3000/api/incidents/inc_test_1/status \
  -H "Authorization: Bearer <token_admin>" \
  -H "Content-Type: application/json" \
  -d '{ "status": "REVIEWED", "adminNote": "ตรวจสอบแล้ว" }'
```

- ตรวจสอบ notification ของ userA
```bash
curl -X GET http://localhost:3000/api/notifications \
  -H "Authorization: Bearer <token_userA>"
```

2) Node.js (Jest + Supertest) — ตัวอย่าง integration test

- ติดตั้ง: `npm install --save-dev jest supertest`
- ตัวอย่างไฟล์ `tests/incident.notification.test.js`

```javascript
const request = require('supertest');
const app = require('../../backend/server'); // path ไปยัง express app ของคุณ

describe('Incident -> Notification', () => {
  let adminToken;
  let userToken;

  beforeAll(async () => {
    // ดึง token จาก API login (สมมติมีผู้ใช้อยู่แล้ว)
    const r1 = await request(app).post('/api/auth/login').send({ email: 'admin@example.com', password: 'AdminPassword123' });
    adminToken = r1.body.data.token;

    const r2 = await request(app).post('/api/auth/login').send({ email: 'alice@example.com', password: 'password' });
    userToken = r2.body.data.token;
  });

  test('admin updates incident -> notifications created', async () => {
    // เตรียม incident ใน DB (อาจใช้ seed หรือ factory)
    // ต่อไปเรียก PATCH
    const res = await request(app)
      .patch('/api/incidents/inc_test_1/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'REVIEWED', adminNote: 'ok' });

    expect(res.status).toBe(200);
    // ตรวจสอบ notification ของ userA
    const notif = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${userToken}`);

    expect(notif.status).toBe(200);
    expect(Array.isArray(notif.body.data)).toBe(true);
    const found = notif.body.data.find(n => n.metadata?.incidentId === 'inc_test_1');
    expect(found).toBeDefined();
    expect(found.title).toContain('REVIEWED');
  });
});
```

หมายเหตุ
- ปรับ `app` path ให้ตรงกับโปรเจกต์ของคุณ
- ก่อนรัน automated test ให้ seed DB ด้วยผู้ใช้และ incident ที่ใช้ในการทดสอบ

สรุป
- ตัวอย่างข้างต้นครอบคลุม manual flow และตัวอย่าง integration test ที่ใช้งานจริงได้หลังจากมี endpoint ครบถ้วน
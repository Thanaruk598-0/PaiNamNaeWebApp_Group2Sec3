Test Data — ตัวอย่างข้อมูลสำหรับทดสอบ

1) ผู้ใช้ตัวอย่าง
- admin
{
  "id": "admin_1",
  "email": "admin@example.com",
  "role": "ADMIN"
}

- userA (reporter)
{
  "id": "user_a",
  "email": "alice@example.com",
  "role": "PASSENGER"
}

- userB (related user)
{
  "id": "user_b",
  "email": "bob@example.com",
  "role": "DRIVER"
}

2) Incident ตัวอย่าง
- Incident with related user
{
  "id": "inc_test_1",
  "reporterId": "user_a",
  "type": "DRIVER",
  "priority": "HIGH",
  "title": "คนขับไม่มารับ",
  "description": "รอ 30 นาที",
  "relatedUserId": "user_b",
  "status": "PENDING",
  "createdAt": "2026-02-18T10:00:00Z"
}

- Incident without related user
{
  "id": "inc_test_2",
  "reporterId": "user_a",
  "type": "ROUTE",
  "priority": "MEDIUM",
  "title": "ป้ายหยุดผิดที่",
  "description": "ป้ายอยู่ใกล้เลนรถ",
  "relatedUserId": null,
  "status": "PENDING",
  "createdAt": "2026-02-18T11:00:00Z"
}

3) Notification ตัวอย่าง (คาดว่าจะถูกสร้างเมื่อแอดมินอัปเดต)
{
  "id": "notif_1",
  "userId": "user_a",
  "type": "INCIDENT",
  "title": "รายงาน: คนขับไม่มารับ - REVIEWED",
  "body": "ตรวจสอบแล้ว",
  "link": "/incidents/inc_test_1",
  "metadata": { "incidentId": "inc_test_1", "status": "REVIEWED" },
  "readAt": null,
  "createdAt": "2026-02-18T12:00:00Z"
}

หมายเหตุการใช้งาน
- ใช้ข้อมูลข้างต้นเป็น seed ใน DB เพื่อทำ automated/integration tests
- ถ้าใช้ Prisma seed: สร้าง user, incident ตามตัวอย่าง จากนั้นรัน test case
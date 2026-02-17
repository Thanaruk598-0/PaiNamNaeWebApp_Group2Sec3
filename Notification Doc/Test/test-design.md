Test Design — Notification (Incident) Subsystem

เป้าหมายการทดสอบ
- ยืนยันว่าการอัปเดตสถานะ Incident (โดยแอดมิน) จะสร้าง Notification ให้ผู้ที่เกี่ยวข้อง
- ยืนยันว่า Notification มีฟิลด์สำคัญครบถ้วน: title, body, link, metadata, readAt
- ตรวจสอบการจัดการข้อผิดพลาด: ถ้าไม่สามารถสร้าง notification ได้ การอัปเดต incident ยังคงสำเร็จ

ขอบเขตการทดสอบ
- Positive cases: PENDING → REVIEWED, REVIEWED → RESOLVED
- Negative cases: Incident ไม่พบ, reporterId ไม่มีอยู่จริง, database write ล้มเหลว
- Integration: Backend (incident.service) → notification.service → DB → Frontend แสดงผล

รายการ Test Case
1. TC-01: แอดมินอัปเดต incident ที่มี relatedUserId
   - ขั้นตอน: สร้าง incident (reporterId=userA, relatedUserId=userB) → PATCH status REVIEWED
   - คาดผล: สร้าง notification 2 รายการ (userA, userB)

2. TC-02: แอดมินอัปเดต incident ที่ไม่มี relatedUserId
   - คาดผล: สร้าง notification 1 รายการ (reporter)

3. TC-03: อัปเดต incident ที่ไม่มีอยู่
   - คาดผล: คืน 404, ไม่มี notification ถูกสร้าง

4. TC-04: ถ้า notifService ล้มเหลว (simulate throw)
   - คาดผล: Incident อัปเดตสำเร็จ, บันทึก log ข้อผิดพลาด, ไม่มี exception ถูกส่งกลับให้ client

5. TC-05: Frontend ดึง notification list
   - คาดผล: GET /api/notifications คืนรายการที่มี `link` เป็น `/incidents/{id}` และ `metadata.incidentId` ตรงกัน

เกณฑ์การยอมรับ
- ทุก TC ที่เป็น Positive ต้องผ่าน
- Negative cases ต้องให้ผลลัพธ์ที่คาดไว้ (404 หรือ log)

สิ่งที่ต้องเตรียมก่อนทดสอบ
- DB Schema พร้อม (migration ถูกเรียกใช้)
- ผู้ใช้ตัวอย่าง: admin + userA + userB
- Token สำหรับ admin และ user
- Endpoint ของ backend ขึ้นใช้งานได้ (หรือ mock สำหรับบางกรณี)

เครื่องมือแนะนำ
- Postman / curl สำหรับ manual tests
- Jest / Supertest หรือ Mocha+Chai สำหรับ automated integration test
- Prisma Studio เพื่อตรวจสอบตาราง Notification
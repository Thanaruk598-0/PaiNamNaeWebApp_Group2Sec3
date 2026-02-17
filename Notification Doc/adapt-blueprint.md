ชื่อเอกสาร: Adapt Blueprint — Notification Subsystem

สรุปสั้น ๆ
- วัตถุประสงค์: อธิบายโครงร่างการเชื่อมต่อระบบแจ้งเตือน (Notification) กับ Incident workflow ของโปรเจกต์ เพื่อให้ทีมอื่นสามารถปรับใช้อย่างปลอดภัยและไม่กระทบระบบหลัก
- กลุ่มเป้าหมาย: นักพัฒนาที่จะต่อยอด (Task 2,4,5,6), DevOps, QA

ขอบเขต
- ครอบคลุมเฉพาะ: การสร้างแจ้งเตือนเมื่อแอดมินอัปเดตสถานะ Incident, โครง payload, การแสดงผลบน frontend (link + metadata)
- ไม่ครอบคลุม: ระบบ push notification ภายนอก (FCM/APNs), ระบบจัดคิวหนักๆ (หากต้องการให้เพิ่มแยกโมดูล)

สถาปัตยกรรมย่อ
1. Event: แอดมินเรียก `PATCH /api/incidents/:id/status`
2. Service: `incident.service.adminUpdateStatus()` อัปเดตฐานข้อมูล แล้วเรียก `notifService.createNotificationByAdmin()`
3. Persistence: Notification ถูกบันทึกในตาราง `Notification` (fields: id, userId, type, title, body, link, metadata, readAt, createdAt)
4. Frontend: layout/notification bell อ่านจาก `GET /api/notifications` และแสดง `link` เป็นลิงก์ไปยัง `/incidents/{id}`

Payload (ตัวอย่างมาตรฐาน)
- Notification object (backend → DB / API response):
  - id: string
  - userId: string
  - type: INCIDENT
  - title: string
  - body: string
  - link: string (ตัวอย่าง: "/incidents/{id}")
  - metadata: { incidentId, status }
  - readAt: Date | null
  - createdAt: Date

ข้อแนะนำการปรับใช้อย่างปลอดภัย
- อย่า hardcode URL path เป็น absolute (เช่น http://localhost:3000) ให้ใช้ relative `link: '/incidents/{id}'`
- การสร้าง notification ไม่ควรขัดขวางการทำงานหลัก (ทำเป็น try/catch และไม่ throw ถ้าการสร้าง noti ล้มเหลว)
- ระบุ `type` ให้ชัด (ใช้ `INCIDENT` สำหรับแจ้งเตือนจาก incident)

สัญญาณเตือนที่ต้องระวัง
- หากสร้าง notification แล้วเห็นปริมาณเพิ่มผิดปรกติ ให้ตรวจสอบ loop ใน service (อย่าให้ service เรียกตัวเอง)
- ถ้ามี required foreign-key (reporterId / relatedUserId) ต้องตรวจสอบว่ามี user นั้นอยู่ในระบบก่อนบันทึก

แนวทางขยายในอนาคต
- เพิ่มช่องทางแจ้งเตือน (อีเมล, SMS, push) ผ่าน adapter pattern
- แยก queue worker สำหรับส่ง notification ปริมาณมาก

บันทึกจบบทนี้: เอกสารนี้เป็นแผนปรับใช้ง่าย ๆ เพื่อให้ทีมอื่นสามารถเชื่อมต่อกับ notification ได้โดยไม่ยุ่งกับโค้ดส่วนอื่น ๆ ของระบบหลัก
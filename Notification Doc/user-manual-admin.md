คู่มือแอดมิน — การจัดการ Incident และ Notification

ภาพรวม
- แอดมินมีสิทธิ์อัปเดตสถานะของ Incident และเมื่ออัปเดต ระบบจะสร้าง Notification ให้กับผู้ที่เกี่ยวข้องโดยอัตโนมัติ

การอัปเดตสถานะ (ตัวอย่าง)
- Endpoint: `PATCH /api/incidents/:id/status`
- สิทธิ์: ต้องเป็นแอดมิน (ใช้ middleware `requireAdmin`)
- Payload:
  - `status`: one of [PENDING, REVIEWED, RESOLVED, REJECTED]
  - `adminNote`: ข้อความเพิ่มเติม (optional)

ตัวอย่างคำสั่ง (curl)
```
curl -X PATCH http://localhost:3000/api/incidents/inc_12345/status \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{ "status": "REVIEWED", "adminNote": "ตรวจสอบแล้ว" }'
```

ผลลัพธ์ที่คาดหวัง
- Incident จะมี `status` เปลี่ยนเป็นค่าใหม่
- `reviewedById` และ `reviewedAt` จะถูกบันทึก
- สร้าง Notification ให้ `reporterId` และ `relatedUserId` (ถ้ามี)

การสร้าง Notification ด้วยตนเอง (ถ้าจำเป็น)
- ถ้าต้องการส่งข้อความพิเศษ ให้เรียกใช้ controller ของ notification (มีอยู่แล้ว) เช่น `POST /api/notifications` (ถ้ามี implement)

ข้อควรระวัง
- อย่าแก้ไข payload ของ notification โดยไม่แจ้งทีม (metadata ต้องคง `incidentId` เอาไว้)
- การสร้าง notification ไม่ควรทำให้ request ล้มเหลว — ถ้าการส่ง noti ล้มเหลว ให้บันทึก log และคืนค่าการอัปเดต incident เป็นสำเร็จ

การตรวจสอบและแก้ปัญหา
- ตรวจสอบ log เมื่อมีการแจ้งเตือนผิดพลาด (error 'Failed to create incident notification')
- ตรวจสอบฐานข้อมูลตาราง Notification ว่ามีเรคอร์ดถูกสร้างหรือไม่
- ถ้าผู้ใช้ไม่เห็นแจ้งเตือน ให้ตรวจสอบ token/สิทธิ์ และเรียก GET /api/notifications ด้วย token ของผู้รับ

คำแนะนำเชิงปฏิบัติ
- หากต้องการเห็นการทำงานแบบ end-to-end ให้สร้าง incident โดยผู้ใช้งานจริง แล้วแอดมินอัปเดตสถานะ จากนั้นตรวจดู notification ของผู้รายงาน
- เก็บ `adminNote` ที่มีประโยชน์เพื่อลดการตอบคำถามผู้ใช้หลังจากเปลี่ยนสถานะ
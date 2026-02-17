Changelog — Notification subsystem

v1.0 - 2026-02-18
- สร้างระบบแจ้งเตือนสำหรับ Incident (Task 3 & 7)
- เพิ่ม service `adminUpdateStatus()` ที่จะสร้าง notification ให้ `reporterId` และ `relatedUserId` (ถ้ามี)
- เปลี่ยน `notification.type` ให้เป็น `INCIDENT` สำหรับการแจ้งเตือนจาก incident
- เพิ่ม frontend: notification bell + /notifications page (mock API ถูกใช้ระหว่างการพัฒนา)

v1.1 - (แนะนำ)
- ลบ mock API จาก frontend แล้วให้ Task 2 จัดการ endpoint จริง
- ปรับปรุง log message ให้ชัดเจนเมื่อสร้าง notification ล้มเหลว

หมายเหตุ
- ให้บันทึก entry ของ changelog ทุกครั้งที่แก้ schema หรือ payload ของ notification เพื่อให้ทีม QA ติดตามการเปลี่ยนแปลงได้ง่าย
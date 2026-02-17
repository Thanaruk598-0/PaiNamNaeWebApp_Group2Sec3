README — Notification Subsystem (สรุปสำหรับผู้รับผิดชอบส่วนนี้)

ผู้รับผิดชอบ: pyrosixth1
อีเมล: thammaphon.s@kkumail.com

---

**สรุป**
- ส่วน Notification นี้ครอบคลุมการสร้างและส่งแจ้งเตือนเมื่อแอดมินอัปเดตสถานะ `Incident` เท่านั้น
- โฟกัสคือ: อัปเดตสถานะโดยแอดมิน → บันทึก incident → สร้าง `Notification` ให้ผู้เกี่ยวข้อง (reporter, relatedUser)

**ฟีเจอร์หลัก (ที่ดูแล)**
- แอดมินอัปเดตสถานะ Incident ผ่าน `PATCH /api/incidents/:id/status` และระบบจะสร้าง Notification อัตโนมัติ
- Notification จะมี `title`, `body`, `link`, `metadata` (เช่น incidentId, status)
- Frontend แสดงไอคอนกระดิ่ง และหน้า `/notifications` สำหรับดูรายการทั้งหมด (ต้องให้ Task 2 ให้ endpoint จริง)
- มาร์ก "อ่านแล้ว" และลบ notification ได้จากหน้าแจ้งเตือน

**ขั้นตอนการตั้งค่า (Quick start)**
1. ดึงโค้ดล่าสุดและเข้าไปที่โปรเจกต์:
```bash
cd c:/SoftEnProjFull/PaiNamNaeWebApp_Group2Sec3
```
2. ตั้งค่า backend `.env` และรัน migration (ถ้ายังไม่ได้):
```bash
cd backend
# ตั้งค่า DATABASE_URL ในไฟล์ .env
npx prisma migrate dev --name add_incident_model
npm install
npm run dev
```
3. รัน frontend (เพื่อดู UI):
```bash
cd frontend
npm install
npm run dev
```
4. (ถ้า editor แจ้งหาไฟล์ tsconfig) ให้รัน `npm run dev` ใน `frontend` เพื่อให้ Nuxt สร้าง `.nuxt/tsconfig.server.json` หรือปล่อย stub ที่สร้างไว้ก่อนหน้า

**หน้าเว็บที่เกี่ยวข้อง**
- Notification panel (header layout): `frontend/layouts/default_v1.vue`
- หน้าแจ้งเตือนเต็ม: `frontend/pages/notifications/index.vue`
- ลิงก์ detail ของ incident: `/incidents/{id}` 

**ไฟล์ที่สร้าง/แก้ไข**
- backend/prisma/schema.prisma — เพิ่ม `Incident` model + enums
- backend/src/services/incident.service.js — `adminUpdateStatus()` (สร้าง notification)
- backend/src/controllers/incident.controller.js — controller สำหรับ patch status
- backend/src/validations/incident.validation.js — Zod validation
- backend/src/routes/incident.routes.js — route สำหรับ incidents
- backend/src/routes/index.js — mount incident routes
- backend/src/services/notification.service.js — (มีอยู่) ถูกเรียกจาก incident.service
- frontend/layouts/default_v1.vue — เพิ่ม notification bell + panel mapping
- frontend/pages/notifications/index.vue — หน้าแจ้งเตือน (ดึงจาก API)
- frontend/nuxt.config.js — ปรับ apiBase เป็น `/api` (dev mock)
- (ใน repo ผมลบ mock API ที่เคยมีใน `frontend/server/api/notifications` เพื่อไม่ให้ไปปะปนกับ API จริง)

**สรุปการทดสอบ**
- Manual:
  1. สร้าง incident (POST /api/incidents) — Task 2
  2. แอดมินอัปเดตสถานะ (PATCH /api/incidents/:id/status) → ควรเห็น notification ใน GET /api/notifications
- Automated: ตัวอย่างไฟล์ทดสอบอยู่ใน `Notification Doc/Test/test-code.md` (Jest + Supertest ตัวอย่าง)

**ข้อควรระวัง / Notes**
- อย่าแก้ payload ของ notification (`metadata.incidentId`) โดยไม่แจ้งทีมเพราะจะกระทบการเชื่อมต่อหน้า detail

- หากต้องการส่งช่องทางอื่น (อีเมล, push) ควรทำเป็น adapter แยกต่างหาก


---

Declare — การใช้ปัญญาประดิษฐ์ (AI)

- บทสรุป: ในการทำงานชุดนี้มีการใช้เครื่องมือช่วยอัตโนมัติ (AI-assisted tools) เพื่อช่วยเร่งงานเขียนเอกสารและร่างตัวอย่างโค้ด แต่การตัดสินใจสุดท้าย การทดสอบ และการนำโค้ดไปใช้งานจริงต้องทำโดยบุคคลของทีมเท่านั้น (ผู้รับผิดชอบ: `pyrosixth1`).

- งานที่ใช้ AI ช่วยทำ
  - ร่างเอกสารภาษาไทย (คู่มือ, สรุปการตั้งค่า, Test Plan)
  - สร้างตัวอย่างโค้ดและสคริปต์ทดสอบ (curl, Jest+Supertest ตัวอย่าง)
  - ช่วยวิเคราะห์ปัญหาเบื้องต้นและเสนอการแก้ไขโค้ด (เช่น เปลี่ยน `notification.type`, ปรับ logging)

- ข้อจำกัดและความรับผิดชอบของมนุษย์
  - โค้ดตัวอย่างหรือการเปลี่ยนแปลงที่ AI เสนอ ควรถูกทบทวนโดยผู้พัฒนาที่รู้บริบทของระบบก่อน merge
  - ห้ามอาศัย AI แทนการตรวจสอบความปลอดภัย (security review), การจัดการข้อมูลส่วนบุคคล, หรือการทดสอบกลุ่มผู้ใช้จริง

- ความเป็นส่วนตัวของข้อมูล
  - AI ถูกใช้เพื่อประมวลผลข้อความและตัวอย่างโค้ดที่ให้ไว้ในบริบทนี้เท่านั้น ไม่มีการแนบหรือส่งข้อมูลผู้ใช้จริงเพิ่มเติมนอกเหนือจากที่ทีมให้ไว้ (เช่น อีเมลผู้รับผิดชอบ)

- แนวทางปฏิบัติที่แนะนำ
  - บันทึก prompt/คำสั่งที่ใช้และผลลัพธ์ไว้ในโฟลเดอร์ `Notification Doc/` หากต้องการความโปร่งใส (เช่น `ai-prompts.md`)
  - ทุก pull request ที่มีการเปลี่ยนแปลงโค้ดที่เกี่ยวข้องกับ notification ต้องมี human review และรัน integration tests ก่อน merge

---


# คู่มือการผสานรวม - Task 3 & 7 (Notification + Incident Status Update)

**สถานะ:** ✅ เสร็จแล้ว โค้ดพร้อมใช้งาน

---

## 📋 สรุปการดำเนินการ

### Backend (Task 3 & 7)
✅ **เสร็จแล้ว:**
- Prisma schema: Model `Incident` พร้อม Enums (IncidentStatus, IncidentType, IncidentPriority)
- Service: `incident.service.js` — ฟังก์ชัน `adminUpdateStatus()` สร้าง notification อัตโนมัติ
- Controller: `incident.controller.js` — จัดการ API `PATCH /api/incidents/:id/status`
- Route: `incident.routes.js` — Mount ที่ `/api/incidents`
- Validation: `incident.validation.js` — Zod schema สำหรับตรวจสอบข้อมูล

**ขั้นตอนการสร้าง Notification:**
- เมื่อแอดมินอัปเดตสถานะ → ระบบสร้าง Notification 2 อัน:
  - ส่งให้ `reporterId` (ผู้รายงาน)
  - ส่งให้ `relatedUserId` (ถ้ามี และต่างจากผู้รายงาน)
- Notification มีข้อมูล: `title`, `body`, `link`, `metadata`

### Frontend (Task 3 & 7)
✅ **เสร็จแล้ว:**
- ไอคอนกระดิ่ง + แพนล์แจ้งเตือนใน `layouts/default_v1.vue`
- Mock API endpoints สำหรับทดสอบ
- หน้า `/notifications` สำหรับปุ่ม "ดูการแจ้งเตือนทั้งหมด"
- สามารถคลิก notification เพื่อไปยังลิงก์ได้

---

## ⚠️ **ปัญหาที่พบเมื่อเปรียบเทียบกับ Branch `Thanaruk_5980`**

### 1. **Model Incident ยังไม่อยู่ใน Original Schema**
- **สถานะ:** ✅ **เพิ่มเข้าไปแล้ว** (อยู่ใน main repo แล้ว)
- **การกระทำ:** Task 1 ต้องดึงเอา schema ล่าสุดจาก main หรือรับการเปลี่ยนแปลงนี้

**ฟิลด์ที่เพิ่มเข้าไป:**
```javascript
model Incident {
  id, reporterId, reporter, type, priority, relatedUserId, relatedUser, 
  relatedRouteId, relatedRoute, relatedBookingId, relatedBooking,
  title, description, status, adminNote, reviewedById, reviewedBy, reviewedAt, createdAt, updatedAt
}

// Enum ที่เพิ่ม
IncidentStatus: PENDING | REVIEWED | RESOLVED | REJECTED
IncidentType: DRIVER | PASSENGER | ROUTE | BOOKING | SYSTEM | OTHER
IncidentPriority: LOW | MEDIUM | HIGH | CRITICAL
```

**ความสัมพันธ์ที่เพิ่มใน User, Route, Booking:**
```javascript
// ใน User model
reportedIncidents: Incident[] @relation("IncidentReporter")
targetedIncidents: Incident[] @relation("IncidentTargetUser")
adminReviewedIncidents: Incident[] @relation("IncidentAdmin")

// ใน Route model
incidents: Incident[]

// ใน Booking model
incidents: Incident[]
```

---

### 2. **ยังไม่มี Endpoint สำหรับดึงข้อมูล Incident**
- **ขาดหายไป:**
  - `GET /api/incidents` (ดูรายการ)
  - `GET /api/incidents/:id` (ดูรายละเอียด)
  - ตัวกรองตามสถานะ, ลำดับความสำคัญ, ประเภท
  - การแบ่งหน้า (pagination)

**การกระทำ:** Task 2 ต้องเพิ่ม:
```javascript
// GET /api/incidents (ดูรายการทั้งหมด พร้อมตัวกรอง)
// GET /api/incidents/:id (ดูรายละเอียดเดี่ยว)
// GET /api/incidents?status=PENDING&priority=HIGH&type=DRIVER&page=1&limit=20
```

---

### 3. **ยังไม่มี Admin Incident Dashboard**
- Task 4 จะต้องใช้ endpoints ของ list + detail จาก Task 2

---

## ✅ **ที่เชื่อมต่อและใช้งานได้แล้ว**

### อัปเดตสถานะ Incident จากแอดมิน (Task 3 & 7)
**คำขอ:**
```bash
PATCH /api/incidents/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "REVIEWED",
  "adminNote": "ตรวจสอบแล้วถูกต้อง"
}
```

**การตอบสนอง:**
```json
{
  "success": true,
  "message": "อัปเดต Incident เรียบร้อย",
  "data": {
    "id": "...",
    "status": "REVIEWED",
    "reviewedById": "admin_id",
    "reviewedAt": "2026-02-18T...",
    ...
  }
}
```

**การสร้าง Notification:**
- ✅ สร้าง notification สำหรับ `reporterId` ด้วย:
  - `title`: "รายงาน: [incident.title] - REVIEWED"
  - `body`: "[adminNote]" หรือ "[status]"
  - `link`: "/incidents/{id}"
  - `metadata`: `{ incidentId, status }`
- ✅ สร้าง notification สำหรับ `relatedUserId` (เนื้อหาเดียวกัน)
- ✅ ใช้ `notifService.createNotificationByAdmin()` ที่มีอยู่แล้ว

---

## 🔗 **การเชื่อมต่อระหว่างส่วนต่างๆ**

### Notification → ดูรายละเอียด Incident
**Frontend:** `layouts/default_v1.vue`
```javascript
// Notification มีฟิลด์ `link`
// คลิก notification จะไปยัง n.link (เช่น "/incidents/{id}")
```

**ยังต้องทำ:** 
- หน้า: `/incidents/[id]` (ดูรายละเอียด) — **Task 5 ทำได้**

---

## 📝 **ที่ Task 2 ต้องสร้าง**

### ต้องมี (เพื่อให้ Task 3 & 7 ทำงานได้):
- ✅ `PATCH /api/incidents/:id/status` — **เสร็จแล้ว (โดย Task 3)**

### ควรมี (สำหรับ Task 4, 5, 6):
1. `GET /api/incidents` (ดูรายการ แบ่งหน้า สามารถกรองได้)
2. `GET /api/incidents/:id` (ดูรายละเอียด รวมความสัมพันธ์)
3. `POST /api/incidents` (สร้างรายงานโดยผู้ใช้)
4. `PUT/PATCH /api/incidents/:id` (อัปเดตโดยผู้รายงาน/แอดมิน)
5. `DELETE /api/incidents/:id` (ลบโดยแอดมิน)

### ตัวกรองที่ต้องรองรับ:
```
?status=PENDING,REVIEWED
&priority=HIGH,CRITICAL
&type=DRIVER,PASSENGER
&reporterId={userId}
&relatedUserId={userId}
&page=1&limit=20
&sortBy=createdAt|priority|status
&sortOrder=asc|desc
```

---

## 📝 **ที่ Task 1 ต้องทำ**

### การกระทำ:
1. **ดึง schema ล่าสุดจาก main branch** (มี Incident model อยู่แล้ว)
2. **หรือรับการเปลี่ยนแปลง Incident** ใน schema.prisma

### การ migrate:
```bash
npx prisma migrate dev --name add_incident_model
```

---

## 🧪 **การทดสอบ (Postman/ทดลองด้วยมือ)**

### 1. สร้าง Incident (ต้อง Task 2 endpoint)
```bash
POST /api/incidents
{
  "reporterId": "user_abc",
  "type": "DRIVER",
  "priority": "HIGH",
  "title": "คนขับไม่มารับ",
  "description": "...",
  "relatedUserId": "user_xyz"
}
```

### 2. แอดมินอัปเดตสถานะ (✅ พร้อมใช้งาน)
```bash
PATCH /api/incidents/inc_abc/status
Authorization: Bearer <admin_token>
{
  "status": "REVIEWED",
  "adminNote": "ตกลง"
}
```

### 3. ตรวจสอบ Notification ที่สร้าง
```bash
GET /api/notifications
Authorization: Bearer <reporter_token>

# ควรเห็น notification 2 อัน (ถ้ามี relatedUserId)
```

### 4. ตรวจสอบ Frontend
- ไอคอนกระดิ่ง → แพนล์แสดง Notification จาก Incident
- คลิก → ไปยัง `/incidents/{id}` (ต้องมีหน้า Task 5)

---

## 🚀 **ขั้นตอนถัดไป**

1. **Task 1:** ดึง schema หรือรับการเปลี่ยนแปลง
2. **Task 2:** เพิ่ม GET endpoints สำหรับดึง incident (list + detail)
3. **Task 4:** สร้าง admin dashboard โดยใช้ endpoints จาก Task 2
4. **Task 5:** สร้างหน้า incident detail + UI สำหรับอัปเดต
5. **Task 6:** สร้างหน้า "รายงานของฉัน" โดยใช้ endpoint list จาก Task 2
6. **ทดสอบแบบครบถ้วน:** รายงาน → อัปเดต → notification → คลิกไปดู

---

## 📂 **ไฟล์ที่แก้ไข/เพิ่มเข้าไป**

| ไฟล์ | สถานะ | หมายเหตุ |
|------|--------|---------|
| `backend/prisma/schema.prisma` | ✅ แก้ไข | เพิ่ม Incident model + enums + ความสัมพันธ์ |
| `backend/src/services/incident.service.js` | ✅ เพิ่ม | อัปเดตสถานะ + สร้าง notification |
| `backend/src/controllers/incident.controller.js` | ✅ เพิ่ม | API handler |
| `backend/src/validations/incident.validation.js` | ✅ เพิ่ม | Zod schema |
| `backend/src/routes/incident.routes.js` | ✅ เพิ่ม | Route definitions |
| `backend/src/routes/index.js` | ✅ แก้ไข | Mount incident routes |
| `frontend/layouts/default_v1.vue` | ✅ แก้ไข | Notification UI + link support |
| `frontend/pages/notifications/index.vue` | ✅ เพิ่ม | หน้าแจ้งเตือนเต็ม |
| `frontend/server/api/notifications.get.js` | ✅ เพิ่ม | Mock API (dev) |
| `frontend/server/api/notifications/[id]/read.patch.js` | ✅ เพิ่ม | Mock API (dev) |
| `frontend/server/api/notifications/[id].delete.js` | ✅ เพิ่ม | Mock API (dev) |
| `frontend/nuxt.config.js` | ✅ แก้ไข | เปลี่ยน API base เป็น `/api` |

---

## ❓ **คำถามสำหรับ Task 2 (Branch Thanaruk_5980)**

1. มี GET `/api/incidents` (ดูรายการ) endpoint หรือยัง?
   - ถ้ามี: ฟอร์แมต response เป็นไร? รองรับตัวกรองอะไรบ้าง?
   - ถ้าไม่มี: จะเพิ่มไหม? เมื่อไร?

2. มี GET `/api/incidents/:id` endpoint หรือยัง?
   - Response มีข้อมูล `relatedUser`, `relatedRoute`, `relatedBooking` ไหม?

3. API ของคุณคืนข้อมูล Incident ในฟอร์แมตที่คาดหวังไหม?
   - ฟิลด์ที่ต้องมี: `id`, `title`, `reporterId`, `status`, `type`, `priority`, `createdAt`

4. สามารถ merge schema changes (Incident model) ได้ไหม?

---

**อัปเดตล่าสุด:** 2026-02-18  
**สร้างโดย:** Code Assistant (Task 3 & 7)

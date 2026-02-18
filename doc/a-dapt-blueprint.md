# 🏗️ A-DAPT Blueprint — Incident Report System

## ข้อมูลโครงการ

| รายการ | ค่า |
|--------|-----|
| ระบบ | PaiNamNae WebApp — ระบบแจ้งเหตุการณ์ |
| โมดูล | Incident Report |
| ผู้พัฒนา | Phuchit_6114 |
| วันที่ | 16 กุมภาพันธ์ 2569 |

---

## A — Analysis (การวิเคราะห์)

### ปัญหาที่พบ
ระบบเดิมมีฟีเจอร์รายงานขั้นพื้นฐาน (เลือกหมวดหมู่ + กรอกข้อความ) แต่ยังขาด:
- ไม่สามารถระบุ **ประเภทเหตุการณ์** ที่ชัดเจนได้
- ไม่มี **ระดับความสำคัญ** ทำให้ Admin ไม่รู้ว่าเรื่องไหนเร่งด่วน
- ไม่สามารถระบุ **ตำแหน่งที่เกิดเหตุ** ทำให้ติดตามเหตุการณ์ได้ยาก
- ไม่รองรับ **การแนบรูปภาพ** เป็นหลักฐาน

### ผู้มีส่วนได้ส่วนเสีย (Stakeholders)

| ผู้มีส่วนได้ส่วนเสีย | บทบาท | ความต้องการ |
|---------------------|--------|-----------|
| ผู้โดยสาร (User) | ผู้แจ้งเหตุ | แจ้งปัญหาได้ง่าย ปักหมุดแม่นยำ แนบหลักฐาน |
| ผู้ดูแลระบบ (Admin) | จัดการรายงาน | จัดลำดับความสำคัญ กรอง/ค้นหา อัปเดตสถานะ |

### Functional Requirements

| ID | ความต้องการ | ประเภท |
|----|-----------|--------|
| FR-01 | ผู้ใช้สามารถเลือกประเภทเหตุการณ์ได้ 6 ประเภท | Must Have |
| FR-02 | ผู้ใช้สามารถเลือกระดับความสำคัญได้ 4 ระดับ | Must Have |
| FR-03 | ผู้ใช้ต้องปักหมุดตำแหน่งบน Google Maps | Must Have |
| FR-04 | ผู้ใช้สามารถแนบรูปภาพประกอบได้ | Should Have |
| FR-05 | Admin สามารถกรองรายงานตามประเภท/ความสำคัญ/สถานะ | Must Have |
| FR-06 | Admin สามารถอัปเดตสถานะ + เพิ่มหมายเหตุได้ | Must Have |
| FR-07 | Admin เห็นแผนที่ + รูปภาพในหน้ารายละเอียด | Should Have |
| FR-08 | ผู้ใช้และ Admin สามารถแชทคุยกันได้แบบ Real-time | Should Have |
| FR-09 | ระบบต้องบันทึกประวัติการแชท | Must Have |
| FR-10 | ผู้ใช้ต้องได้รับการแจ้งเตือนเมื่อสถานะรายงานเปลี่ยนแปลง | Must Have |
| FR-11 | Admin ไม่ควรเห็นปุ่มแจ้งเตือนที่ไม่จำเป็น | Should Have |

---

## D — Design (การออกแบบ)

### Entity Relationship

```
┌──────────┐       ┌──────────┐
│   User   │──1:N──│  Report  │
└──────────┘       └──────────┘──1:N──┌──────────┐
                        │             │  Message │
                   ┌────┴────┐        └──────────┘
                   │ Fields  │             │
                   ├─────────┤        ┌────┴────┐
                   │ id       │       │ Fields  │
                   │ userId   │       ├─────────┤
                   │ incidentType (enum) │ id    │
                   │ priority (enum)     │ reportId │
                   │ title    │       │ senderId │
                   │ description │    │ content  │
                   │ location (JSON)     │ readAt   │
                   │ imageUrl │       │ createdAt│
                   │ status (enum)       │ updatedAt│
                   │ adminNote│       └─────────┘
                   │ createdAt│
                   │ updatedAt│
                   └─────────┘
                        │
                   ┌────┴─────────┐
                   │ Notification │
                   ├──────────────┤
                   │ id           │
                   │ userId       │
                   │ type (enum)  │
                   │ title        │
                   │ body         │
                   │ link         │
                   │ metadata (JSON)│
                   │ readAt       │
                   │ createdAt    │
                   └──────────────┘
```

### Enum Values

| Enum | Values |
|------|--------|
| IncidentType | DRIVER, PASSENGER, ROUTE, BOOKING, SYSTEM, OTHER |
| IncidentPriority | LOW, MEDIUM, HIGH, CRITICAL |
| ReportStatus | PENDING, IN_PROGRESS, RESOLVED, REJECTED |
| NotificationType | SYSTEM, REPORT_UPDATE, NEW_REPORT |

### API Architecture

```
Client (Nuxt.js)
    │
    ├──POST /api/reports──────────────┐
    ├──GET  /api/reports/me───────────┤
    ├──GET  /api/reports/admin────────┤
    ├──GET  /api/reports/admin/:id────┤  → Express Router
    ├──PUT  /api/reports/admin/:id────┤     → Middleware (auth, upload, validate)
    ├──DELETE /api/reports/admin/:id──┘        → Controller → Service → Prisma → PostgreSQL
    │
    ├──GET /api/notifications─────────┐
    ├──PATCH /api/notifications/:id/read──┤
    ├──DELETE /api/notifications/:id──┘
    │
    ├──Socket.IO (Real-time Chat & Notif)─┐
    │   ├── connect / disconnect      │
    │   ├── join_room / leave_room    │
    │   ├── send_message              │
    │   ├── typing                    │
    │   └── new_notification          │
    └─────────────────────────────────┘
```

### Technology Stack

| Layer | เทคโนโลยี |
|-------|----------|
| Frontend | Nuxt.js 3 (Vue.js), Google Maps JavaScript API |
| Backend | Express.js, Multer (file upload), Zod (validation) |
| Database | PostgreSQL 16 + Prisma ORM |
| Storage | Cloudinary (image hosting) |
| Real-time | Socket.IO |
| Auth | JWT (Bearer Token) |

---

## A — Architect (สถาปัตยกรรม)

### Directory Structure

```
backend/
├── prisma/
│   └── schema.prisma              ← Data model + enums
├── src/
│   ├── socket.js                  ← Socket.IO setup & logic
│   ├── controllers/
│   │   └── report.controller.js   ← Request handling + Cloudinary upload
│   │   └── chat.controller.js     ← Chat history API
│   ├── services/
│   │   └── report.service.js      ← Business logic + Prisma queries
│   │   └── chat.service.js        ← Chat logic
│   ├── validations/
│   │   └── report.validation.js   ← Zod schemas
│   ├── routes/
│   │   └── report.routes.js       ← Route definitions + middleware
│   └── docs/
│       └── report.doc.js          ← Swagger documentation

frontend/
├── pages/
│   ├── myReports/
│   │   └── index.vue              ← User: สร้าง + ดูรายงาน
│   └── admin/reports/
│       ├── index.vue              ← Admin: ตารางรายงาน + filter
│       └── [id]/index.vue         ← Admin: รายละเอียด + อัปเดต
├── components/admin/
│   ├── AdminHeader.vue            ← Profile dropdown
│   └── AdminSidebar.vue           ← Report menu link
└── layouts/
    └── default.vue                ← Navbar report link
```

---

## P — Process (กระบวนการ)

### User Flow

```
User Login → /myReports → กรอกฟอร์ม → ปักหมุดแผนที่ → (แนบรูป) → ส่งรายงาน
                                                                        ↓
Admin Login → /admin/reports → กรอง/ค้นหา → คลิกดู → ดูรายละเอียด+แผนที่+รูป
                                                        ↓
                                                 อัปเดตสถานะ + หมายเหตุ → บันทึก
                                                        ↓
                               Notification แจ้งเตือน User → User คลิก → ดูรายละเอียด
                                                        ↓
                                          (Optional) User & Admin แชทคุยรายละเอียดเพิ่มเติม
```

### Migration Process

| ลำดับ | Migration | คำอธิบาย |
|-------|-----------|----------|
| 1 | `add_report_model` | สร้าง table Report + ReportCategory enum |
| 2 | `add_incident_type_priority_location_image` | เปลี่ยน category → incidentType, เพิ่ม priority/location/imageUrl |
| 3 | `make_location_required` | บังคับ location ต้องมีค่า |
| 4 | `add_chat_message` | สร้าง table Message เชื่อมกับ Report |

---

## T — Testing (การทดสอบ)

### สรุปการทดสอบ

| ประเภท | จำนวน Test Cases | เครื่องมือ |
|--------|-----------------|---------|
| API Testing | 24 cases | Jest + Supertest |
| UAT Testing | 14 cases | Manual Testing |
| **รวม** | **38 cases** | |

### ผลการทดสอบ

| ประเภท | ผ่าน | ไม่ผ่าน | อัตราผ่าน |
|--------|------|---------|----------|
| API Testing | 24 | 0 | 100% |
| UAT Testing | 14 | 0 | 100% |
| **รวม** | **38** | **0** | **100%** |

ดูรายละเอียดได้ที่:
- `test/api/report.api.test.js` — API test code
- `test/uat-test-cases.md` — UAT test cases
- `test/test-design.md` — Test design
- `test/test-data.md` — Test data
- `doc/test-report.md` — Test report

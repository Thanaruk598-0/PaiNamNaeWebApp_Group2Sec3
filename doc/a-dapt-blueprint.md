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

---

## D — Design (การออกแบบ)

### Entity Relationship

```
┌──────────┐       ┌──────────┐
│   User   │──1:N──│  Report  │
└──────────┘       └──────────┘
                        │
                   ┌────┴────┐
                   │ Fields  │
                   ├─────────┤
                   │ id       │
                   │ userId   │
                   │ incidentType (enum) │
                   │ priority (enum)     │
                   │ title    │
                   │ description │
                   │ location (JSON)     │
                   │ imageUrl │
                   │ status (enum)       │
                   │ adminNote│
                   │ createdAt│
                   │ updatedAt│
                   └─────────┘
```

### Enum Values

| Enum | Values |
|------|--------|
| IncidentType | DRIVER, PASSENGER, ROUTE, BOOKING, SYSTEM, OTHER |
| IncidentPriority | LOW, MEDIUM, HIGH, CRITICAL |
| ReportStatus | PENDING, IN_PROGRESS, RESOLVED, REJECTED |

### API Architecture

```
Client (Nuxt.js)
    │
    ├──POST /api/reports──────────────┐
    ├──GET  /api/reports/me───────────┤
    ├──GET  /api/reports/admin────────┤
    ├──GET  /api/reports/admin/:id────┤  → Express Router
    ├──PUT  /api/reports/admin/:id────┤     → Middleware (auth, upload, validate)
    └──DELETE /api/reports/admin/:id──┘        → Controller → Service → Prisma → PostgreSQL
```

### Technology Stack

| Layer | เทคโนโลยี |
|-------|----------|
| Frontend | Nuxt.js 3 (Vue.js), Google Maps JavaScript API |
| Backend | Express.js, Multer (file upload), Zod (validation) |
| Database | PostgreSQL 16 + Prisma ORM |
| Storage | Cloudinary (image hosting) |
| Auth | JWT (Bearer Token) |

---

## A — Architect (สถาปัตยกรรม)

### Directory Structure

```
backend/
├── prisma/
│   └── schema.prisma              ← Data model + enums
├── src/
│   ├── controllers/
│   │   └── report.controller.js   ← Request handling + Cloudinary upload
│   ├── services/
│   │   └── report.service.js      ← Business logic + Prisma queries
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
                                             User เห็นสถานะ + หมายเหตุอัปเดต
```

### Migration Process

| ลำดับ | Migration | คำอธิบาย |
|-------|-----------|----------|
| 1 | `add_report_model` | สร้าง table Report + ReportCategory enum |
| 2 | `add_incident_type_priority_location_image` | เปลี่ยน category → incidentType, เพิ่ม priority/location/imageUrl |
| 3 | `make_location_required` | บังคับ location ต้องมีค่า |

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

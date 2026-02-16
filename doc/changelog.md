# 📝 Change Log — Incident Report System

## [1.0.0] — 2026-02-16

### ✨ Added (เพิ่มใหม่)

#### Backend
- **Prisma Schema:** เพิ่ม enum `IncidentType` (DRIVER, PASSENGER, ROUTE, BOOKING, SYSTEM, OTHER) และ `IncidentPriority` (LOW, MEDIUM, HIGH, CRITICAL)
- **Report Model:** เพิ่ม field `incidentType`, `priority`, `location` (JSON), `imageUrl` ใน model Report
- **Controller:** `report.controller.js` — จัดการ request/response, อัปโหลดรูปไป Cloudinary
- **Service:** `report.service.js` — CRUD, filter, sort, pagination, admin notification
- **Validation:** `report.validation.js` — Zod schema สำหรับ incidentType, priority, location
- **Routes:** `report.routes.js` — กำหนด routes + middleware (auth, upload, validate)
- **Swagger:** `report.doc.js` — API documentation สำหรับ multipart/form-data
- **Migration:** `add_incident_type_priority_location_image` — เปลี่ยน schema จาก category → incidentType
- **Migration:** `make_location_required` — บังคับ location ต้องมีค่า

#### Frontend
- **My Reports (`/myReports`):** ฟอร์มสร้างรายงานใหม่พร้อม IncidentType dropdown, Priority selector, Google Maps ปักหมุด, Image upload + preview
- **Admin Reports (`/admin/reports`):** ตารางรายงาน + filter (สถานะ/ประเภท/ความสำคัญ) + sort + pagination
- **Admin Report Detail (`/admin/reports/:id`):** แสดงข้อมูลครบ + แผนที่ read-only + รูปภาพ Lightbox + อัปเดตสถานะ
- **Admin Sidebar:** เพิ่มเมนู Report Management
- **Admin Header:** เพิ่ม Profile Dropdown (บัญชีของฉัน, Dashboard, Logout)
- **Navbar:** เพิ่มเมนู "แจ้งเหตุการณ์" (User) / "ดูรายงานทั้งหมด" (Admin)

### 🐛 Fixed (แก้ไข)
- แก้ Cloudinary URL property mismatch (`secure_url` → `url`)
- แก้ Google Maps ไม่โหลดในหน้า Admin Detail (เพิ่ม polling mechanism)
- แก้เบอร์โทรผู้แจ้งหายหลังกดบันทึก (เพิ่ม `phoneNumber` ใน user select ของ updateReportStatus)

### 🔧 Changed (เปลี่ยนแปลง)
- เปลี่ยน `ReportCategory` enum → `IncidentType` enum (DRIVER, PASSENGER, ROUTE, BOOKING, SYSTEM, OTHER)
- เปลี่ยน `location` จาก optional → required (บังคับปักหมุด)
- POST `/api/reports` เปลี่ยนจาก `application/json` → `multipart/form-data` เพื่อรองรับ image upload

### 📁 Files Changed

| ไฟล์ | สถานะ |
|------|-------|
| `backend/prisma/schema.prisma` | Modified |
| `backend/src/controllers/report.controller.js` | New |
| `backend/src/services/report.service.js` | New |
| `backend/src/validations/report.validation.js` | New |
| `backend/src/routes/report.routes.js` | New |
| `backend/src/routes/index.js` | Modified |
| `backend/src/docs/report.doc.js` | New |
| `frontend/pages/myReports/index.vue` | New |
| `frontend/pages/admin/reports/index.vue` | New |
| `frontend/pages/admin/reports/[id]/index.vue` | New |
| `frontend/components/admin/AdminHeader.vue` | Modified |
| `frontend/components/admin/AdminSidebar.vue` | Modified |
| `frontend/layouts/default.vue` | Modified |

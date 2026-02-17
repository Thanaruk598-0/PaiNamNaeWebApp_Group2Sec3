# 🐳 การตั้งค่า Database ด้วย Docker — PaiNamNae WebApp

## ผู้ตั้งค่า
- **ชื่อ:** Phuchit_6114
- **อีเมล:** phuchit.ch@kkumail.com

---

## ⚙️ ข้อมูลการเชื่อมต่อ Database

| รายการ | ค่า |
|--------|-----|
| Database | MySQL 8.0 |
| Host | localhost |
| Port | **3307** (เปลี่ยนจาก 3306 เพื่อไม่ให้ชนกับ MySQL ตัวอื่นที่รันอยู่แล้ว) |
| Database Name | painamnae_db |
| Username | painamnae_user |
| Password | painamnae_pass |
| Root Password | rootpassword |

### DATABASE_URL
```
mysql://painamnae_user:painamnae_pass@localhost:3307/painamnae_db
```

---

## 🚀 ขั้นตอนการตั้งค่า

### 1. เปิด Docker Desktop
ตรวจสอบให้แน่ใจว่า Docker Desktop เปิดอยู่และทำงานปกติ

### 2. รัน Docker Container
```bash
# ที่ root ของโปรเจกต์
docker compose up -d
```

### 3. รัน Prisma Migration
```bash
cd backend
npx prisma migrate dev --name init
```
สร้างตารางทั้งหมดในฐานข้อมูลตาม schema ที่กำหนดไว้ใน `prisma/schema.prisma`

### 4. เชื่อมต่อ Database ผ่าน MySQL Workbench
1. เปิด **MySQL Workbench**
2. คลิก **+** เพื่อเพิ่ม Connection ใหม่
3. กรอกข้อมูล:

   | ช่อง | ค่า |
   |------|-----|
   | Connection Name | `PaiNamNae Docker` |
   | Hostname | `localhost` |
   | Port | `3307` |
   | Username | `painamnae_user` |
   | Password | `painamnae_pass` (กด Store in Vault) |
   | Default Schema | `painamnae_db` |

4. กด **Test Connection** เพื่อทดสอบ → กด **OK**
5. ดูตารางได้ที่ **Schemas → painamnae_db → Tables**

### 5. รัน Backend Server
```bash
npm run dev
```

### 6. ตั้งค่า Admin Account
เพิ่มค่าเหล่านี้ใน `backend/.env`:
```env
ADMIN_EMAIL=pooh@gmail.com
ADMIN_USERNAME=pooh01
ADMIN_PASSWORD=12345678
ADMIN_FIRST_NAME=Phuchit
ADMIN_LAST_NAME=Champachon
```
เมื่อ restart backend server ระบบจะสร้าง Admin account ให้อัตโนมัติ

### 7. เข้าหน้า Admin
1. เปิด browser ไปที่ `http://localhost:3001/login`
2. Login ด้วยบัญชี Admin:
   - **Email:** `pooh@gmail.com`
   - **Password:** `12345678`

#### หน้า Admin ที่ใช้งานได้:

| เมนู | URL | คำอธิบาย |
|------|-----|----------|
| จัดการผู้ใช้ | `/admin/users` | ดู/แก้ไข/ลบ ผู้ใช้ทั้งหมด |
| จัดการเส้นทาง | `/admin/routes` | ดู/แก้ไข/ลบ เส้นทาง |
| จัดการการจอง | `/admin/bookings` | ดู/แก้ไข/ลบ การจอง |
| จัดการยานพาหนะ | `/admin/vehicles` | ดู/แก้ไข/ลบ ยานพาหนะ |
| ยืนยันคนขับ | `/admin/driver-verifications` | อนุมัติ/ปฏิเสธ การยืนยันตัวตน |
| จัดการรายงาน | `/admin/reports` | ดู/อัปเดตสถานะ/ลบ รายงานเหตุการณ์ |

---

## 📋 คำสั่งที่ใช้บ่อย

```bash
# เปิด database container
docker compose up -d

# ปิด database container
docker compose down

# ปิด + ลบข้อมูลทั้งหมด (ระวัง! ข้อมูลจะหายทั้งหมด)
docker compose down -v

# ดู logs ของ database
docker logs painamnae_db

# ดู Prisma Studio (GUI จัดการข้อมูล)
cd backend && npx prisma studio

# รัน backend server
cd backend && npm run dev
```

---

## 📁 ไฟล์ที่เกี่ยวข้อง

| ไฟล์ | คำอธิบาย |
|------|----------|
| `docker-compose.yml` | ตั้งค่า MySQL container |
| `backend/.env` | เก็บ DATABASE_URL และ config ต่างๆ |
| `backend/prisma/schema.prisma` | โครงสร้างฐานข้อมูล (Prisma Schema, provider: mysql) |

---

## 🚨 ระบบแจ้งเหตุการณ์ (Incident Report System)

### Overview
ระบบแจ้งเหตุการณ์ (Incident Report) ให้ผู้ใช้สามารถแจ้งปัญหาหรือเหตุการณ์ผิดปกติที่พบ โดยต้องระบุ **ประเภทเหตุการณ์**, **ระดับความสำคัญ**, **ปักหมุดตำแหน่ง** บนแผนที่ Google Maps และสามารถ **แนบรูปภาพ** ได้ Admin สามารถจัดการรายงานทั้งหมดผ่านหน้า Report Management

### ประเภทเหตุการณ์ (Incident Type)
| ประเภท | Enum Value | คำอธิบาย |
|--------|------------|----------|
| คนขับ | `DRIVER` | ปัญหาเกี่ยวกับพฤติกรรมหรือการให้บริการของคนขับ |
| ผู้โดยสาร | `PASSENGER` | ปัญหาเกี่ยวกับผู้โดยสาร |
| เส้นทาง | `ROUTE` | ปัญหาเกี่ยวกับเส้นทาง เช่น ถนนปิด, เส้นทางผิด |
| การจอง | `BOOKING` | ปัญหาเกี่ยวกับระบบการจอง |
| ระบบ | `SYSTEM` | ปัญหาเกี่ยวกับระบบหรือแอปพลิเคชัน |
| อื่นๆ | `OTHER` | ปัญหาอื่นๆ ที่ไม่เข้าหมวดหมู่ข้างต้น |

### ระดับความสำคัญ (Incident Priority)
| ระดับ | Enum Value | สี Badge |
|-------|------------|----------|
| ต่ำ | `LOW` | 🟢 เขียว |
| ปานกลาง | `MEDIUM` | 🟡 เหลือง |
| สูง | `HIGH` | 🟠 ส้ม |
| วิกฤต | `CRITICAL` | 🔴 แดง |

### สถานะรายงาน (Report Status)
| สถานะ | Enum Value | ความหมาย |
|-------|------------|----------|
| รอดำเนินการ | `PENDING` | ยังไม่ได้รับการตรวจสอบ |
| กำลังดำเนินการ | `IN_PROGRESS` | Admin กำลังดำเนินการ |
| แก้ไขแล้ว | `RESOLVED` | แก้ไขปัญหาเรียบร้อย |
| ปฏิเสธ | `REJECTED` | ปฏิเสธรายงาน |

### ฟีเจอร์หลัก

#### 🗺️ ปักหมุดตำแหน่งบน Google Maps (บังคับ)
- ผู้ใช้ต้องคลิกบนแผนที่เพื่อปักหมุดตำแหน่งที่เกิดเหตุ
- ระบบจะบันทึก `lat`, `lng` และ `address` (ถ้ามี)
- หน้า Admin Detail แสดงแผนที่พร้อมหมุดตำแหน่งแบบ read-only

#### 📸 อัปโหลดรูปภาพ (ไม่บังคับ)
- รองรับไฟล์ภาพ (JPG, PNG, etc.) ขนาดไม่เกิน 5MB
- อัปโหลดไปเก็บที่ **Cloudinary** (`painamnae/reports` folder)
- แสดงพรีวิวก่อนส่ง + สามารถลบรูปที่เลือกได้
- หน้า Admin Detail แสดงรูปพร้อม Lightbox viewer

### API Endpoints

| Method | Path | Auth | คำอธิบาย |
|--------|------|------|----------|
| `POST` | `/api/reports` | User | แจ้งเหตุใหม่ (multipart/form-data) |
| `GET` | `/api/reports/me` | User | ดูรายงานของฉัน |
| `GET` | `/api/reports/admin` | Admin | ดูรายงานทั้งหมด (filter/sort/pagination) |
| `GET` | `/api/reports/admin/:id` | Admin | ดูรายละเอียดรายงาน |
| `PUT` | `/api/reports/admin/:id` | Admin | อัปเดตสถานะ + หมายเหตุ |
| `DELETE` | `/api/reports/admin/:id` | Admin | ลบรายงาน |

### หน้าเว็บที่เกี่ยวข้อง

| หน้า | URL | คำอธิบาย |
|------|-----|----------|
| My Reports (User) | `/myReports` | แจ้งเหตุ + ดูรายงานของตัวเอง |
| Report Management (Admin) | `/admin/reports` | ดู/กรอง/เรียง/ลบ รายงานทั้งหมด |
| Report Detail (Admin) | `/admin/reports/:id` | ดูรายละเอียด + อัปเดตสถานะ + เพิ่มหมายเหตุ |

### ไฟล์ที่สร้าง/แก้ไข

#### Backend (สร้างใหม่)

| ไฟล์ | คำอธิบาย |
|------|----------|
| `backend/src/controllers/report.controller.js` | Controller จัดการ request/response + อัปโหลดรูปไป Cloudinary |
| `backend/src/services/report.service.js` | Business logic: CRUD + filter/sort/pagination + แจ้งเตือน Admin |
| `backend/src/validations/report.validation.js` | Zod schema สำหรับ validate ข้อมูล (incidentType, priority, location) |
| `backend/src/routes/report.routes.js` | กำหนด routes + middleware (auth, upload, validate) |
| `backend/src/docs/report.doc.js` | Swagger documentation สำหรับ API |

#### Backend (แก้ไข)

| ไฟล์ | สิ่งที่แก้ไข |
|------|-------------|
| `backend/prisma/schema.prisma` | เพิ่ม enum `IncidentType`, `IncidentPriority` และปรับ model `Report` (เพิ่ม `incidentType`, `priority`, `location`, `imageUrl`) |
| `backend/src/routes/index.js` | เพิ่ม `reportRoutes` เข้า router หลัก |

#### Database Migrations

| Migration | คำอธิบาย |
|-----------|----------|
| `20260215135910_add_report_model` | สร้าง table Report พื้นฐาน |
| `20260216090553_add_incident_type_priority_location_image` | เพิ่ม enum IncidentType/IncidentPriority, เปลี่ยน category → incidentType, เพิ่ม priority, location, imageUrl |
| `20260216092025_make_location_required` | เปลี่ยน location จาก optional เป็น required |

#### Frontend (สร้างใหม่)

| ไฟล์ | คำอธิบาย |
|------|----------|
| `frontend/pages/myReports/index.vue` | หน้าแจ้งเหตุของ User: ฟอร์มสร้างรายงาน + Google Maps ปักหมุด + อัปโหลดรูป + รายการรายงาน |
| `frontend/pages/admin/reports/index.vue` | หน้าจัดการรายงานของ Admin: ตาราง + filter (สถานะ/ประเภท/ความสำคัญ) + เรียงลำดับ + pagination |
| `frontend/pages/admin/reports/[id]/index.vue` | หน้ารายละเอียดรายงาน: แสดงข้อมูลครบ + แผนที่ + รูปภาพ + ฟอร์มอัปเดตสถานะ/หมายเหตุ |

#### Frontend (แก้ไข)

| ไฟล์ | สิ่งที่แก้ไข |
|------|-------------|
| `frontend/layouts/default.vue` | เพิ่มเมนู "แจ้งเหตุการณ์" ใน Navbar (Desktop + Mobile) โดย User เห็นลิงก์ไป `/myReports` ส่วน Admin เห็นไป `/admin/reports` |
| `frontend/components/admin/AdminSidebar.vue` | เพิ่มเมนู "Report Management" ใน Sidebar ของ Admin |
| `frontend/components/admin/AdminHeader.vue` | เพิ่ม Profile Dropdown (hover) พร้อมเมนู: บัญชีของฉัน, Dashboard, Logout |

---

### วิธีทดสอบ

1. **สร้างรายงาน (User):**
   - Login เป็น user ปกติ → เปิด `/myReports`
   - กรอกข้อมูล: เลือกประเภท, ตั้งระดับความสำคัญ, ใส่หัวข้อ+รายละเอียด
   - ปักหมุดตำแหน่งบนแผนที่ (บังคับ)
   - แนบรูปภาพ (ไม่บังคับ) → กด "ส่งรายงาน"

2. **จัดการรายงาน (Admin):**
   - Login เป็น Admin → เปิด `/admin/reports`
   - ใช้ filter กรองตามสถานะ / ประเภท / ความสำคัญ
   - คลิกดูรายละเอียดรายงาน → เห็นข้อมูลครบ (แผนที่ + รูป)
   - อัปเดตสถานะเป็น `IN_PROGRESS` + เพิ่มหมายเหตุ → กด "บันทึก"

3. **ตรวจสอบผลลัพธ์:**
   - กลับมาดูที่ user → สถานะและ admin note จะอัปเดต
   - ทดสอบ API ผ่าน Swagger UI ที่ `http://localhost:3000/documentation`

4. **API Testing (Supertest):**
   ```bash
   ต้องเปิด backend server (`npm run dev`) ก่อนรัน test
   cd backend && npx jest --forceExit --verbose
   ```
   - ใช้ Jest + Supertest ทดสอบ API ทั้งหมด 24 test cases
   - ครอบคลุม: CRUD, Validation, Auth, Filter, Pagination

---

---

## 📝 Declare — การใช้ปัญญาประดิษฐ์

รายงานฉบับนี้ นำปัญญาประดิษฐ์ **Gemini** มาใช้ในขั้นตอนดังต่อไปนี้

1. **ออกแบบโครงสร้างฐานข้อมูล** — ช่วยออกแบบ Prisma Schema สำหรับระบบ Incident Report (enum `IncidentType`, `IncidentPriority`, model `Report` รวมถึง field `location`, `imageUrl`)
2. **พัฒนา Backend API** — ช่วยเขียน Controller, Service, Validation (Zod), Routes, และ Swagger Documentation สำหรับ Report endpoints ทั้งหมด
3. **พัฒนา Frontend Pages** — ช่วยเขียนหน้า Vue.js สำหรับ User (My Reports: ฟอร์มสร้างรายงาน, Google Maps ปักหมุด, อัปโหลดรูปภาพ) และ Admin (Report Management: ตารางรายงาน, ฟิลเตอร์, หน้ารายละเอียดรายงาน)
4. **ปรับปรุง UI Components** — ช่วยปรับ AdminHeader (เพิ่ม Profile Dropdown), AdminSidebar (เพิ่มเมนู Report), และ Navbar (เพิ่มลิงก์แจ้งเหตุการณ์)
5. **แก้ไขข้อผิดพลาด (Debugging)** — ช่วยวิเคราะห์และแก้ไขปัญหาต่างๆ เช่น Prisma Client EPERM, Cloudinary URL mismatch, Google Maps loading timing issue, และ missing user fields after save
6. **ปรับปรุงระบบแชท (Chat System)** — แก้ไขปัญหา Real-time Update ของผู้ใช้ (Socket Join Room Issue) และปรับสีธีมของ Admin Chat ให้เป็นสีน้ำเงินตาม Design System

โดยข้าพเจ้าได้ตรวจสอบความถูกต้องและแก้ไขข้อผิดพลาดอันเนื่องมาจากผลลัพธ์จากปัญญาประดิษฐ์เรียบร้อยแล้ว

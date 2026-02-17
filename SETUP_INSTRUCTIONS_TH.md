# 📘 คู่มือการตั้งค่าและทดสอบ - Task 3 & 7

**ระดับความสำคัญ:** 🟢 เสร็จแล้ว | **ไทม์ไลน์:** ทดสอบได้ทันที

---

## 🚀 ขั้นตอนการเตรียมระบบ (5 ขั้น)

### ขั้นที่ 1: ดึง Repository ล่าสุด
```bash
cd c:\Users\KodomoPokko\Desktop\SoftEnProjFull\PaiNamNaeWebApp_Group2Sec3

# ดึง code ล่าสุด
git pull origin main
```

### ขั้นที่ 2: อัพเดต Database Schema
```bash
cd backend

# ตรวจสอบและอัพเดต Prisma schema
npx prisma migrate dev --name sync_incident_model

# หากเกิดข้อผิดพลาด ให้ทำ reset:
# npx prisma migrate reset --force
```

**ผลลัพธ์ที่คาดหวัง:**
```
✔ Generated Prisma Client (7.xxx)
✔ Database synced
✔ Incident table created
```

### ขั้นที่ 3: ตั้งค่า Environment Variables
สร้างไฟล์ `.env` ในโฟลเดอร์ `backend/`:

```env
# === DATABASE ===
DATABASE_URL="mysql://username:password@localhost:3306/pai_nam_nae_db"

# === SERVER ===
PORT=3000
NODE_ENV=development

# === JWT ===
JWT_SECRET=your_secret_key_here_change_me_in_production
JWT_EXPIRE=7d

# === ADMIN ===
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=AdminPassword123
```

**ตัวอย่างสำหรับ MySQL Local:**
```env
DATABASE_URL="mysql://root:password@localhost:3306/pai_nam_nae"
JWT_SECRET=development_secret_key_123
```

### ขั้นที่ 4: เริ่มต้นเซิร์ฟเวอร์ Backend
```bash
cd backend

# ติดตั้ง dependencies (ถ้ายังไม่ได้)
npm install

# เริ่มต้นเซิร์ฟเวอร์
npm start
# หรือ (ต้องติดตั้ง nodemon)
npm run dev

# ผลลัพธ์ที่คาดหวัง:
# Server is running on http://localhost:3000
```

### ขั้นที่ 5: เริ่มต้นเซิร์ฟเวอร์ Frontend
```bash
cd frontend

# ติดตั้ง dependencies (ถ้ายังไม่ได้)
npm install

# เริ่มต้นเซิร์ฟเวอร์ dev
npm run dev

# ผลลัพธ์ที่คาดหวัง:
# ➜ Nuxt app: http://localhost:3000 (หรือเปิดด้วยตัวเองที่ http://localhost:3000)
```

---

## 🔌 API Endpoints ที่พร้อมใช้งาน

### 1. อัพเดตสถานะ Incident (แอดมิน)
```
PATCH /api/incidents/:id/status
```

**ตัวอย่างคำขอ:**
```bash
curl -X PATCH http://localhost:3000/api/incidents/inc_12345/status \
  -H "Authorization: Bearer <token_admin>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "REVIEWED",
    "adminNote": "ตรวจสอบแล้ว ไม่มีปัญหา"
  }'
```

**ตัวอย่างการตอบสนอง:**
```json
{
  "success": true,
  "message": "อัปเดต Incident เรียบร้อย",
  "data": {
    "id": "inc_12345",
    "status": "REVIEWED",
    "adminNote": "ตรวจสอบแล้ว ไม่มีปัญหา",
    "reviewedById": "admin_user_id",
    "reviewedAt": "2026-02-18T14:30:00Z"
  }
}
```

**ตัวอย่างการตอบสนองเมื่อมีข้อผิดพลาด:**
```json
{
  "success": false,
  "message": "ไม่พบ Incident",
  "statusCode": 404
}
```

**Statuses ที่มี:**
- `PENDING` - รอตรวจสอบ
- `REVIEWED` - ตรวจสอบแล้ว
- `RESOLVED` - แก้ไขแล้ว
- `REJECTED` - ปฏิเสธ

---

### 2. ดูรายการแจ้งเตือน (ของผู้ใช้)
```
GET /api/notifications
```

**ตัวอย่างคำขอ:**
```bash
curl -X GET http://localhost:3000/api/notifications \
  -H "Authorization: Bearer <token_user>"
```

**ตัวอย่างการตอบสนอง:**
```json
{
  "success": true,
  "data": [
    {
      "id": "notif_abc123",
      "userId": "user_xyz",
      "title": "รายงาน: การไม่มาของคนขับ - REVIEWED",
      "body": "แอดมินได้ตรวจสอบรายงานของคุณแล้ว",
      "type": "INCIDENT",
      "link": "/incidents/inc_12345",
      "metadata": {
        "incidentId": "inc_12345",
        "status": "REVIEWED"
      },
      "readAt": null,
      "createdAt": "2026-02-18T14:30:00Z"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

---

## 🧪 ขั้นตอนการทดสอบ

### ขั้นที่ 1: เข้าสู่ระบบ (สร้าง Token)
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "AdminPassword123"
  }'

# ใช้ token จากการตอบสนอง:
# {
#   "success": true,
#   "data": {
#     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
#   }
# }
```

### ขั้นที่ 2: สร้าง Incident (ต้องมี POST endpoint จาก Task 2)
```bash
curl -X POST http://localhost:3000/api/incidents \
  -H "Authorization: Bearer <token_user>" \
  -H "Content-Type: application/json" \
  -d '{
    "reporterId": "user_id",
    "type": "DRIVER",
    "priority": "HIGH",
    "title": "คนขับไม่มารับ",
    "description": "รอคนขับมามากกว่า 30 นาที",
    "relatedUserId": "driver_id"
  }'

# ผลลัพธ์ที่คาดหวัง:
# {
#   "success": true,
#   "data": {
#     "id": "inc_abc123",
#     "status": "PENDING",
#     ...
#   }
# }
```

### ขั้นที่ 3: แอดมินอัพเดตสถานะ
```bash
curl -X PATCH http://localhost:3000/api/incidents/inc_abc123/status \
  -H "Authorization: Bearer <token_admin>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "REVIEWED",
    "adminNote": "ได้สอบสวนและพบว่าคนขับหายไป"
  }'

# ผลลัพธ์ที่คาดหวัง:
# {
#   "success": true,
#   "message": "อัปเดต Incident เรียบร้อย",
#   ...
# }
```

### ขั้นที่ 4: ตรวจสอบ Notification ที่สร้าง
```bash
# โดยผู้รายงาน (user)
curl -X GET http://localhost:3000/api/notifications \
  -H "Authorization: Bearer <token_user>"

# โดยผู้ที่เกี่ยวข้อง (relatedUser)
curl -X GET http://localhost:3000/api/notifications \
  -H "Authorization: Bearer <token_related_user>"

# ควรเห็น notification 2 อัน:
# - เพื่อผู้รายงาน
# - เพื่อ relatedUser (ถ้ามี)
```

### ขั้นที่ 5: ทดสอบ Frontend UI

**1. ไอคอนกระดิ่ง:**
- เยี่ยมชม http://localhost:3000
- ควรเห็นไอคอนกระดิ่ง 🔔 ในมุมบนขวา
- ควรแสดงหมายเลข (จำนวน notification ที่ยังไม่ได้อ่าน)

**2. แพนล์แจ้งเตือน:**
- คลิกไอคอนกระดิ่ง → เปิดแพนล์
- ควรเห็นรายการ notification จาก Incident
- ข้อมูลที่ควรแสดง:
  - ชื่อเรื่อง (title)
  - รายละเอียด (body)
  - เวลา (timeAgo: "2 hours ago")
  - สถานะอ่าน (ปุ่มดำเนินการ: เครื่องหมายอ่าน, ลบ)

**3. ลิงก์ Notification:**
- คลิก notification ใน panel → ควรไปยัง `/incidents/{id}` (ต้องมีหน้า Task 5)
- หลังจาก Task 5 เสร็จ: สามารถดูรายละเอียด Incident

**4. หน้าแจ้งเตือนแบบเต็ม:**
- ไปที่ http://localhost:3000/notifications
- ควรเห็นรายการแจ้งเตือนทั้งหมด
- สามารถมาร์ก "อ่านแล้ว" และลบได้

---

## 📊 Schema Database

### Model: Incident
```javascript
model Incident {
  id            String    @id @default(cuid())
  
  // ผู้รายงาน
  reporterId    String
  reporter      User      @relation("IncidentReporter", fields: [reporterId], references: [id])
  
  // ข้อมูลรายงาน
  type          IncidentType      // DRIVER | PASSENGER | ROUTE | BOOKING | SYSTEM | OTHER
  priority      IncidentPriority  // LOW | MEDIUM | HIGH | CRITICAL
  title         String
  description   String
  
  // เกี่ยวข้องกับผู้ใช้/ระบบ
  relatedUserId String?
  relatedUser   User?     @relation("IncidentTargetUser", fields: [relatedUserId], references: [id])
  
  relatedRouteId   String?
  relatedRoute     Route?  @relation(fields: [relatedRouteId], references: [id])
  
  relatedBookingId String?
  relatedBooking   Booking? @relation(fields: [relatedBookingId], references: [id])
  
  // สถานะ
  status        IncidentStatus  // PENDING | REVIEWED | RESOLVED | REJECTED
  adminNote     String?
  
  // ผู้ตรวจสอบ (แอดมิน)
  reviewedById   String?
  reviewedBy    User?     @relation("IncidentAdmin", fields: [reviewedById], references: [id])
  reviewedAt    DateTime?
  
  // เวลา
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  @@index([reporterId])
  @@index([status])
  @@index([priority])
}

// Enums
enum IncidentStatus {
  PENDING
  REVIEWED
  RESOLVED
  REJECTED
}

enum IncidentType {
  DRIVER
  PASSENGER
  ROUTE
  BOOKING
  SYSTEM
  OTHER
}

enum IncidentPriority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}
```

---

## 🔑 ตัวแปร Environment ที่อธิบาย

| ตัวแปร | ตัวอย่าง | คำอธิบาย |
|--------|---------|----------|
| `DATABASE_URL` | `mysql://root:pass@localhost:3306/db` | การเชื่อมต่อ MySQL |
| `PORT` | `3000` | พอร์ตเซิร์ฟเวอร์ |
| `NODE_ENV` | `development` | สภาพแวดล้อม (dev/prod) |
| `JWT_SECRET` | `secret123` | กุญแจลับสำหรับ JWT |
| `JWT_EXPIRE` | `7d` | เวลาหมดอายุ token |
| `ADMIN_EMAIL` | `admin@example.com` | อีเมลแอดมิน (สำหรับตั้งค่าเริ่มต้น) |
| `ADMIN_PASSWORD` | `AdminPassword123` | รหัสผ่านแอดมิน (สำหรับตั้งค่าเริ่มต้น) |

---

## ❓ คำถามที่พบบ่อย

### 1. ข้อผิดพลาด: "ไม่พบ Prisma Client"
```bash
# วิธีแก้ไข:
cd backend
npm install
npx prisma generate
```

### 2. ข้อผิดพลาด: "Database connection failed"
```bash
# ตรวจสอบ:
# 1. MySQL ขึ้นอยู่หรือไม่?
# 2. DATABASE_URL ถูกต้องหรือไม่?
# 3. ชื่อผู้ใช้และรหัสผ่าน ถูกต้องหรือไม่?

# ทดสอบการเชื่อมต่อ:
mysql -u root -p -h localhost
USE pai_nam_nae_db;
SHOW TABLES;
```

### 3. ข้อผิดพลาด: "Unauthorized" เมื่อทดสอบ API
```
ให้ใช้ token ที่ได้จากการเข้าสู่ระบบ:
1. POST /api/auth/login (ใช้ admin account)
2. คัดลอก "token" จากการตอบสนอง
3. ใส่ใน Header: Authorization: Bearer <token>
```

### 4. ข้อผิดพลาด: "Port 3000 already in use"
```bash
# ตัวเลือก 1: ปิดโปรแกรมที่ใช้ port 3000
# ตัวเลือก 2: เปลี่ยน port ใน .env
PORT=3001

# ตัวเลือก 3: ตรวจสอบ
netstat -ano | findstr :3000
# (Windows)
```

### 5. Frontend ไม่เห็น Notification
```
ตรวจสอบ:
1. Backend ขึ้นอยู่หรือไม่? (npm run dev ใน backend/)
2. Token ถูกต้องหรือไม่? (ล็อกอินแล้วหรือยัง)
3. Notification มี readAt=null หรือไม่ (ยังไม่อ่าน)?
4. เอาคำเสิร์ชดูว่า GET /api/notifications ส่งกลับข้อมูลหรือไม่
```

### 6. Frontend ส่งค่า Notification แต่ Backend ไม่สร้าง
```
ตรวจสอบที่ Incident Service:
1. adminUpdateStatus() ถูกเรียกหรือไม่?
2. notifService.createNotificationByAdmin() ถูกเรียกหรือไม่?
3. ดูได้จากคำขอ: 
   - reporterId มีค่าหรือไม่?
   - relatedUserId มีค่าหรือไม่?
```

### 7. Schema migration ล้มเหลว
```bash
# วิธีแก้ไข:
cd backend
npx prisma migrate reset --force

# หรือ:
npx prisma db push --force-reset
```

---

## 📋 สรุปไฟล์ที่เปลี่ยนแปลง

### Backend
- ✅ `backend/prisma/schema.prisma` — เพิ่ม Incident model + enums + relations
- ✅ `backend/src/services/incident.service.js` — สร้าง service (adminUpdateStatus)
- ✅ `backend/src/controllers/incident.controller.js` — สร้าง controller
- ✅ `backend/src/validations/incident.validation.js` — เพิ่ม Zod schema
- ✅ `backend/src/routes/incident.routes.js` — สร้าง route
- ✅ `backend/src/routes/index.js` — mount route

### Frontend
- ✅ `frontend/layouts/default_v1.vue` — แก้ไข notification UI
- ✅ `frontend/pages/notifications/index.vue` — สร้างหน้าแจ้งเตือน
- ✅ `frontend/nuxt.config.js` — เปลี่ยน API base
- ✅ `frontend/server/api/notifications.get.js` — mock API (dev only)
- ✅ `frontend/server/api/notifications/[id]/read.patch.js` — mock API
- ✅ `frontend/server/api/notifications/[id].delete.js` — mock API

---

## 🎯 ลำดับขั้นตอนสำหรับทั้งทีม

1. **Task 1:** ดึง schema + รัน migration
2. **Task 2:** เพิ่ม GET endpoints
3. **Task 3 & 7:** ✅ เสร็จแล้ว (อยู่ที่นี่)
4. **Task 4:** เขียน Admin Dashboard
5. **Task 5:** เขียนหน้า Incident Detail + Update UI
6. **Task 6:** เขียนหน้า "รายงานของฉัน"

---

## 🔗 ลิงก์ที่มีประโยชน์

- **GitHub Repo:** [PaiNamNaeWebApp_Group2Sec3](https://github.com/your-repo-url)
- **Database Admin (Prisma Studio):** `npx prisma studio`
- **API Documentation:** http://localhost:3000/api-docs (Swagger)
- **Frontend Dev:** http://localhost:3000

---

**อัปเดตล่าสุด:** 2026-02-18  
**ระดับ:** ✅ ทดสอบได้เต็มรูปแบบ  
**ผู้สร้าง:** Code Assistant (Task 3 & 7)

# 🐳 การตั้งค่า Database ด้วย Docker — PaiNamNae WebApp

## ผู้ตั้งค่า
- **ชื่อ:** Phuchit_6114
- **อีเมล:** phuchit.ch@kkumail.com

---

## ⚙️ ข้อมูลการเชื่อมต่อ Database

| รายการ | ค่า |
|--------|-----|
| Database | PostgreSQL 16 (Alpine) |
| Host | localhost |
| Port | **5433** (เปลี่ยนจาก 5432 เพราะมี PostgreSQL ตัวอื่นรันอยู่แล้ว) |
| Database Name | painamnae_db |
| Username | painamnae_user |
| Password | painamnae_pass |

### DATABASE_URL
```
postgresql://painamnae_user:painamnae_pass@localhost:5433/painamnae_db?schema=public
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

### 4. เชื่อมต่อ Database ผ่าน pgAdmin 4
1. เปิด **pgAdmin 4**
2. **คลิกขวา** ที่ **Servers** → **Register** → **Server...**
3. แท็บ **General**:
   - **Name:** `PaiNamNae Docker`
4. แท็บ **Connection**:

   | ช่อง | ค่า |
   |------|-----|
   | Host name/address | `localhost` |
   | Port | `5433` |
   | Maintenance database | `painamnae_db` |
   | Username | `painamnae_user` |
   | Password | `painamnae_pass` |
   | ☑ Save password | ติ๊กเลือก |

5. กด **Save**
6. ดูตารางได้ที่ **Databases → painamnae_db → Schemas → public → Tables**

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
| `docker-compose.yml` | ตั้งค่า PostgreSQL container |
| `backend/.env` | เก็บ DATABASE_URL และ config ต่างๆ |
| `backend/prisma/schema.prisma` | โครงสร้างฐานข้อมูล (Prisma Schema) |

---

## ⚠️ หมายเหตุ
- ใช้ **port 5433** แทน 5432 เพราะเครื่องมี PostgreSQL อีกตัวรันอยู่แล้ว
- ต้องเปิด **Docker Desktop** ก่อนรัน `docker compose up -d` ทุกครั้ง
- ไฟล์ `.env` ไม่ควร push ขึ้น Git (ควรอยู่ใน `.gitignore`)

# 📝 Change Log Sprint 2 — Incident Report System  
(PaiNamNae Web App - Group 2 Sec 3)

---

## [1.0.2] — 2026-03-04  
### 🚀 Added (เพิ่มใหม่)

#### 🧠 Enhanced Chat System
- รองรับการส่ง **รูปภาพและไฟล์แนบ** ในระบบแชท (User & Admin)
- เพิ่มระบบ **File Preview** ก่อนส่งข้อความ
- รองรับการส่ง:
  - ข้อความอย่างเดียว  
  - รูปภาพอย่างเดียว  
  - หรือส่งพร้อมกันทั้งข้อความ + รูปภาพ
- ปรับปรุง Real-time ผ่าน **Socket.IO** ให้รองรับไฟล์แนบ
- เพิ่ม Cloudinary Integration สำหรับอัปโหลดไฟล์อย่างปลอดภัย

#### 📍 Reporting System Improvements
- เพิ่มระบบ **Auto-detect Current Location** (Geo-location API)
- ปรับปรุง Map Picker UI ให้ใช้งานง่ายขึ้น
- แสดง Address จากพิกัดได้แม่นยำขึ้น
- เพิ่มปุ่ม **Clear Location**
- ปรับปรุงข้อความแนะนำการใช้งานแผนที่

#### 🖼️ Report Attachment Upgrade
- รองรับการอัปโหลด **รูปภาพและวิดีโอ**
- จำกัดจำนวนไฟล์แนบไม่เกิน **5 ไฟล์**
- จำกัดขนาดไฟล์ไม่เกิน **20MB ต่อไฟล์**
- ปรับปรุง UI การแสดงผลรูปภาพ/วิดีโอ:
  - หน้า **My Reports**
  - หน้า **Admin Report Detail**
  - ขณะอัปโหลด (Upload Preview)

---

### 🐛 Fixed (แก้ไข)
- แก้ปัญหาหมุดแผนที่คลาดเคลื่อนในบางกรณี
- เพิ่มความเสถียรหลังลากหมุด (Drag-end Geocoding)
- ปรับ Logic การส่งข้อความให้รองรับทุกกรณี Input
- ปรับปรุงการแสดงผลไฟล์แนบใน Chat และ Report Detail

---

### 🔧 Changed (เปลี่ยนแปลง)
- เปลี่ยน `img` → `attachment` ใน model **Report** เพื่อรองรับรูปภาพและวิดีโอ
- ปรับปรุง Prisma Schema รองรับโครงสร้าง ChatMessage แบบใหม่
- เพิ่ม Validation ฝั่ง Backend:
  - จำกัดประเภทไฟล์ (Images / Videos)
  - จำกัดขนาดไฟล์ Chat (Max 10MB)
  - จำกัดขนาดไฟล์ Report (Max 20MB)
- เพิ่ม Middleware (Multer) สำหรับจัดการอัปโหลดไฟล์

---

### 🛠 Technical Changes

#### Backend
- เพิ่มฟิลด์ใน `ChatMessage`:
  - `fileUrl`
  - `fileType`
  - `fileName`
- ปรับปรุง Socket.IO ให้รองรับไฟล์แนบแบบ Real-time
- สร้าง Controller สำหรับอัปโหลดไฟล์ไปยัง Cloudinary
- อัปเดต Prisma Schema สำหรับ Report และ ChatMessage

#### Frontend
- เพิ่มปุ่มแนบไฟล์ (Clip Icon) ในหน้า Chat
- เพิ่มระบบ Preview ก่อนส่ง
- ปรับปรุง UI แสดงผลไฟล์แนบ (User & Admin)
- ปรับปรุงหน้า `/myReports` ให้ดึงตำแหน่งปัจจุบันอัตโนมัติ


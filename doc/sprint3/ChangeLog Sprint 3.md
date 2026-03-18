# 📝 Change Log Sprint — Payment & Booking System  
(PaiNamNae Web App - Group 2 Sec 3)

---

## [2.0.0] — 2026-03-18  

### 🚀 Added (เพิ่มใหม่)

#### 💳 Payment System Enhancement
- เพิ่ม **PassengerPaymentModal** สำหรับระบบชำระเงินแบบหลายขั้นตอน (Multi-step)
  - กรอกข้อมูลการโอน
  - แนบหลักฐานการชำระเงิน
  - ยืนยันการชำระเงิน
- เพิ่มระบบจัดการข้อมูลการชำระเงินในหน้า **Profile**
  - รองรับ PromptPay
  - รองรับบัญชีธนาคาร
- เพิ่มฟีเจอร์:
  - **Copy to Clipboard** สำหรับคัดลอกเลขบัญชี / PromptPay
  - **Download QR Code** สำหรับการชำระเงิน

---

#### 📄 Document Generation System
- เพิ่มระบบสร้างเอกสาร PDF:
  - ใบสำคัญรับเงิน (Receipt Voucher)
  - ใบกำกับภาษีอย่างย่อ (Short Tax Invoice)
- รองรับฟอนต์ภาษาไทย (Sarabun)
- เพิ่มระบบแปลงจำนวนเงินเป็นข้อความภาษาไทย (**BahtText**)
- เพิ่ม API สำหรับ **Regenerate Documents**
- เพิ่ม **PaymentDocumentModal** สำหรับดูและดาวน์โหลดเอกสาร

---

#### 💬 Communication System
- เพิ่ม **BookingChatModal**
  - รองรับการแชทระหว่างผู้โดยสารและคนขับในรายการจอง

---

#### 🗂 Data & Testing
- เพิ่ม Seed Scripts:
  - `seed-many-payments.js`
  - `seed-paid-payment.js`
- เพิ่มชุด **โลโก้ธนาคาร (SVG)** มากกว่า 40 ธนาคาร

---

### 🐛 Fixed (แก้ไข)

- แก้ไขระบบ **Upload ใน Report**
  - รองรับไฟล์ **เสียง (Audio)** และ **PDF**
- แก้ไข UI ใน **PassengerPaymentModal** ให้แสดงผลถูกต้อง
- ปรับปรุง Error Message ของ PromptPay ให้ชัดเจนและเข้าใจง่าย

---

### 🔧 Changed (เปลี่ยนแปลง)

#### 🌐 Localization
- แปลหน้าเว็บทั้งหมดเป็น **ภาษาไทย**

---

#### 🧾 Input Validation
- ปรับข้อจำกัดการกรอกข้อมูล:
  - PromptPay: ไม่เกิน **13 หลัก**
  - เลขบัญชีธนาคาร: **10–12 หลักเท่านั้น**

---

#### 🎨 User Interface (UX/UI)
- ปรับปรุงหน้า:
  - **myTrip**
  - **myRoute**
- ให้รองรับระบบชำระเงินและระบบแชท
- อัปเดต **ConfirmModal**
  - รองรับสถานะ `success` และ `danger`

---

#### ⚙️ Backend System
- ปรับปรุง Route และ Controller:
  - รองรับการดึงข้อมูล **driverPaymentMethods**
- อัปเดต `document.service.js`:
  - รองรับรูปแบบวันที่ภาษาไทย
  - รองรับระบบ BahtText
- อัปเดต `.gitignore`:
  - ยกเว้นไฟล์ PDF ที่ generate จากระบบ

---

### ❗ Behavior Changes (พฤติกรรมที่เปลี่ยนไป)

- เพิ่มความสามารถให้ **คนขับสามารถยกเลิกการจองได้**
  - ในกรณีที่ผู้โดยสารส่งหลักฐานการโอน **ไม่ถูกต้อง**

---

### 🛠 Technical Changes  

#### Backend
- เพิ่มระบบจัดการ Payment Methods (PromptPay / Bank)
- ปรับปรุง Service สำหรับสร้างเอกสาร PDF
- เพิ่ม API สำหรับจัดการเอกสาร (Generate / Regenerate)
- เพิ่ม Validation ด้วย **Zod** สำหรับข้อมูลการชำระเงิน

---

#### Frontend
- เพิ่ม Modal:
  - PassengerPaymentModal
  - PaymentDocumentModal
  - BookingChatModal
- เพิ่มฟีเจอร์:
  - Copy to Clipboard
  - Download QR Code
- ปรับปรุง UI ให้รองรับภาษาไทยทั้งหมด
# User Acceptance Testing (UAT) Test Cases - Incident Report System

## 1. Prerequisites (สิ่งที่ต้องเตรียมก่อนทดสอบ)

- **Database**: Docker container `painamnae_db` ต้องรันอยู่
- **Backend**: เซิร์ฟเวอร์ Backend ต้องรันอยู่ (`npm run dev` ที่ `backend/`)
- **Frontend**: เซิร์ฟเวอร์ Frontend ต้องรันอยู่ (`npm run dev` ที่ `frontend/`)
- **Admin Account**:
    - Email: `pooh@gmail.com`
    - Password: `12345678`

---

## 2. Test Scenarios (กรณีทดสอบ)

### 👤 Role: User (ผู้โดยสาร)

| ID | Test Case | Action (ขั้นตอน) | Expected Result (ผลลัพธ์ที่คาดหวัง) | Status | Note |
|---|---|---|---|---|---|
| **UAT-01** | **Create Report (Success)** | 1. Login เป็น User ทั่วไป<br>2. ไปที่เมนู **"แจ้งเหตุการณ์"** (`/myReports`)<br>3. กรอกฟอร์มครบถ้วน:<br> - เลือกประเภท (Incident): เช่น คนขับ (Driver)<br> - เลือกระดับความสำคัญ (Priority): เช่น สูง (High)<br> - หัวข้อ (Topic) & รายละเอียด (Description)<br> - **ปักหมุดบนแผนที่** (เลือกจุดใดก็ได้)<br> - **แนบรูปภาพ** (ไฟล์ .jpg/.png)<br>4. กดปุ่ม **"ส่งรายงาน"** | - ระบบแจ้งเตือน "บันทึกสำเร็จ"<br>- ข้อมูลใหม่ปรากฏในรายการด้านล่าง/ขวา<br>- สถานะเริ่มต้นเป็น **PENDING** | [x] | Verified by Automated Test |
| **UAT-02** | **Create Report (Validation)** | 1. กดปุ่ม **"ส่งรายงาน"** โดย **ไม่ปักหมุด** หรือ **ไม่กรอกหัวข้อ** | - ปุ่มส่งรายงานกดไม่ได้ (Disabled) หรือ<br>- ระบบแจ้งเตือนให้กรอกข้อมูลให้ครบถ้วน | [x] | Verified by Automated Test |
| **UAT-03** | **View My Reports** | 1. ดูรายการรายงานที่หน้า `/myReports` | - แสดงรายการรายงานที่เคยแจ้งไว้<br>- แสดงสถานะถูกต้อง (PENDING, RESOLVED) | [x] | Verified by Automated Test |

---

### 👮‍♂️ Role: Admin (ผู้ดูแลระบบ)

| ID | Test Case | Action (ขั้นตอน) | Expected Result (ผลลัพธ์ที่คาดหวัง) | Status | Note |
|---|---|---|---|---|---|
| **UAT-04** | **View All Reports** | 1. Login ด้วยควบบัญชี Admin (`pooh@gmail.com`)<br>2. ไปที่เมนู **"Report Management"** (`/admin/reports`) | - แสดงรายการรายงานทั้งหมดจากผู้ใช้ทุกคน<br>- แสดง Badge ระดับความสำคัญ (สีเขียว/เหลือง/แดง) | [x] | Verified by Automated Test |
| **UAT-05** | **Filter Reports** | 1. ที่หน้า `/admin/reports`<br>2. ลอง Filter ตามสถานะ (Status) เป็น `PENDING`<br>3. ลอง Filter ตามประเภท (Type) เป็น `DRIVER` | - ตารางแสดงเฉพาะรายการที่ตรงกับเงื่อนไข<br>- จำนวนรายการลดลงตามการกรอง | [x] | Verified by Automated Test |
| **UAT-06** | **Sort Reports** | 1. ลองคลิกหัวตาราง (วันที่, ระดับความสำคัญ) เพื่อเรียงลำดับ | - รายการเรียงตามลำดับที่เลือก (มากไปน้อย / น้อยไปมาก) | [x] | Verified by Automated Test |
| **UAT-07** | **View Detail** | 1. คลิกปุ่ม **"View"** (รูปตา) ที่รายการใดก็ได้ | - เปิดหน้ารายละเอียด (`/admin/reports/:id`)<br>- แสดงข้อมูลครบถ้วน: หัวข้อ, รายละเอียด, ผู้แจ้ง<br>- **Maps**: แสดงแผนที่ปักหมุดถูกต้อง<br>- **Image**: แสดงรูปภาพ (คลิกขยายได้) | [x] | Verified by Automated Test |
| **UAT-08** | **Update Status** | 1. ในหน้ารายละเอียด<br>2. เปลี่ยนสถานะเป็น **"IN_PROGRESS"** หรือ **"RESOLVED"**<br>3. ใส่หมายเหตุ (Admin Note): "รับเรื่องแล้วครับ"<br>4. กด **"บันทึกการเปลี่ยนแปลง"** | - ระบบแจ้งเตือน "อัปเดตสำเร็จ"<br>- สถานะและหมายเหตุอัปเดตทันที<br>- (Optional) User กลับไปดูที่ `/myReports` เห็นสถานะเปลี่ยนตาม | [x] | Verified by Automated Test |

---

## 3. Results Summary (สรุปผลการทดสอบ)

- [x] **Passed All Cases**: ระบบทำงานได้ตามที่คาดหวังทุกกรณี
- [ ] **Found Issues**: พบข้อผิดพลาด (โปรดระบุในช่อง Note)

---
*Created by Gemini for Phuchit_6114*

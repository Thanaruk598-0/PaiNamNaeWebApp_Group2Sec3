# 💾 Test Data — Incident Report System

## 1. Test Accounts (บัญชีทดสอบ)

| Role | Email | Password | User ID (Sample) |
|------|-------|----------|------------------|
| **Admin** | `pooh@gmail.com` | `12345678` | `AdminUserUUID` |
| **User** | `testuser@gmail.com` | `12345678` | `NormalUserUUID` |

## 2. Enumerations (ค่าคงที่)

### Incident Type
- `DRIVER` (พฤติกรรมคนขับ)
- `PASSENGER` (ผู้โดยสาร)
- `ROUTE` (เส้นทาง)
- `BOOKING` (การจอง)
- `SYSTEM` (ระบบ)
- `OTHER` (อื่นๆ)

### Incident Priority
- `LOW` (ต่ำ - สีเขียว)
- `MEDIUM` (ปานกลาง - สีเหลือง) *Default*
- `HIGH` (สูง - สีส้ม)
- `CRITICAL` (วิกฤต - สีแดง)

### Report Status
- `PENDING` (รอตรวจสอบ) *Default*
- `IN_PROGRESS` (กำลังดำเนินการ)
- `RESOLVED` (แก้ไขแล้ว)
- `REJECTED` (ปฏิเสธ)

## 3. Sample Input Data (ตัวอย่างข้อมูลนำเข้า)

**Valid Report:**
```json
{
  "title": "ขับรถเร็วเกินกำหนด",
  "description": "รถสาย 4 ขับเร็วมากช่วงถนนหน้ามอ",
  "incidentType": "DRIVER",
  "priority": "HIGH",
  "location": { "lat": 16.474, "lng": 102.827, "address": "Khon Kaen University" }
}
```

**Invalid Report (Missing Location):**
```json
{
  "title": "ทดสอบ",
  "incidentType": "OTHER"
}
```
*Expected Error: Location is required*

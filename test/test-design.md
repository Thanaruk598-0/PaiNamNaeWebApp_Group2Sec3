# 🏗️ Test Design — Incident Report System

## 1. Introduction
เอกสารนี้อธิบายกลยุทธ์การทดสอบ (Test Strategy) สำหรับฟีเจอร์ **Incident Report** ของโปรเจกต์ PaiNamNae WebApp

## 2. Test Scope (ขอบเขตการทดสอบ)
การทดสอบครอบคลุมฟังก์ชันการทำงานหลักดังนี้:
- **User**: การสร้างรายงาน, การดูรายงานของตนเอง, การตรวจสอบความถูกต้องของข้อมูล (Validation)
- **Admin**: การดูรายงานทั้งหมด, การกรอง (Filter), การเรียงลำดับ (Sort), การดูรายละเอียด (Detail), การอัปเดตสถานะ (Update Status)

## 3. Test Levels & Tools (ระดับและเครื่องมือ)

### 3.1 API Testing (Integration Test)
ทดสอบการทำงานของ Backend API เพื่อความถูกต้องของ Logic และ Database interaction
- **Tools**: [Jest](https://jestjs.io/), [Supertest](https://www.npmjs.com/package/supertest)
- **Location**: `test/api/report.api.test.js`
- **Coverage**: 24 Test Cases (Success cases, Validation errors, Auth checks)

### 3.2 User Acceptance Testing (UAT)
ทดสอบการใช้งานจริงผ่านหน้าเว็บไซต์ (Frontend) เพื่อตรวจสอบความถูกต้องของ UI/UX และ User Flow
- **Tools**: Manual Testing on Google Chrome
- **Location**: `test/uat-test-cases.md`
- **Coverage**: 8 Main Scenarios (User Flow & Admin Flow)

## 4. Test Environment
- **OS**: Windows
- **Database**: PostgreSQL 16 (Docker)
- **Backend Runtime**: Node.js (Express)
- **Frontend Runtime**: Node.js (Nuxt.js)

## 5. Pass/Fail Criteria
- **Pass**: ฟังก์ชันทำงานถูกต้องตาม Requirement, ไม่มี Error 500, ข้อมูลบันทึกลงฐานข้อมูลถูกต้อง
- **Fail**: ระบบล่ม (Crash), ข้อมูลสูญหาย, ทำงานไม่ตรงตาม Requirement

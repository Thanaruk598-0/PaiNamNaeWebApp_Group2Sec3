# Test Report: Incident Report API

**Date:** 2026-02-18
**Component:** Backend API - Incident Reporting System
**Status:** ✅ Passed

## Summary

The Incident Reporting API has been tested using `jest` and `supertest`. All critical paths for creating, retrieving, updating, and deleting reports have been verified.

- **Total Tests:** 24
- **Passed:** 24
- **Failed:** 0
- **Duration:** ~2.91s

## Detailed Test Cases

### 1. Create Report (POST /api/reports)
| Test Case ID | Description | Result |
| :--- | :--- | :--- |
| TC-API-01 | Create report successfully (all fields) | ✅ Pass |
| TC-API-02 | Create report with default priority | ✅ Pass |
| TC-API-03 | Create report with image upload | ✅ Pass |
| TC-API-04 | Fail: Missing incidentType | ✅ Pass |
| TC-API-05 | Fail: Missing title | ✅ Pass |
| TC-API-06 | Fail: Missing location | ✅ Pass |
| TC-API-07 | Fail: Invalid incidentType | ✅ Pass |
| TC-API-08 | Fail: Unauthorized (No token) | ✅ Pass |

### 2. My Reports (GET /api/reports/me)
| Test Case ID | Description | Result |
| :--- | :--- | :--- |
| TC-API-09 | Get user's own reports | ✅ Pass |
| TC-API-10 | Fail: Unauthorized | ✅ Pass |

### 3. List Reports (GET /api/reports/admin)
| Test Case ID | Description | Result |
| :--- | :--- | :--- |
| TC-API-11 | List all reports (Admin) | ✅ Pass |
| TC-API-12 | Filter by incidentType (DRIVER) | ✅ Pass |
| TC-API-13 | Filter by priority (HIGH) | ✅ Pass |
| TC-API-14 | Filter by status (PENDING) | ✅ Pass |
| TC-API-15 | Search by keyword | ✅ Pass |
| TC-API-16 | Pagination (limit=5) | ✅ Pass |
| TC-API-17 | Fail: Forbidden for non-admin | ✅ Pass |

### 4. Get Report Detail (GET /api/reports/admin/:id)
| Test Case ID | Description | Result |
| :--- | :--- | :--- |
| TC-API-18 | Get detailed report by ID | ✅ Pass |
| TC-API-19 | Fail: Report not found / Invalid ID | ✅ Pass |

### 5. Update Status (PUT /api/reports/admin/:id)
| Test Case ID | Description | Result |
| :--- | :--- | :--- |
| TC-API-20 | Update status to IN_PROGRESS & add note | ✅ Pass |
| TC-API-21 | Update status to RESOLVED | ✅ Pass |
| TC-API-22 | Fail: Invalid status value | ✅ Pass |

### 6. Delete Report (DELETE /api/reports/admin/:id)
| Test Case ID | Description | Result |
| :--- | :--- | :--- |
| TC-API-23 | Delete report successfully | ✅ Pass |
| TC-API-24 | Fail: Report not found | ✅ Pass |

## Conclusion
The backend API for incident reporting is functioning correctly according to the defined specifications. 

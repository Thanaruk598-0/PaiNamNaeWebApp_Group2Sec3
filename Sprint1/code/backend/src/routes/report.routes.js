const express = require('express');
const validate = require('../middlewares/validate');
const { protect, requireAdmin } = require('../middlewares/auth');
const upload = require('../middlewares/upload.middleware');
const reportController = require('../controllers/report.controller');
const {
    createReportSchema,
    updateReportStatusSchema,
    listReportsQuerySchema,
    idParamSchema,
} = require('../validations/report.validation');

const router = express.Router();

// --- Admin Routes ---
// GET /reports/admin
router.get(
    '/admin',
    protect,
    requireAdmin,
    validate({ query: listReportsQuerySchema }),
    reportController.getAllReports
);

// GET /reports/admin/:id
router.get(
    '/admin/:id',
    protect,
    requireAdmin,
    validate({ params: idParamSchema }),
    reportController.getReportById
);

// PUT /reports/admin/:id
router.put(
    '/admin/:id',
    protect,
    requireAdmin,
    validate({ params: idParamSchema, body: updateReportStatusSchema }),
    reportController.updateReportStatus
);

// DELETE /reports/admin/:id
router.delete(
    '/admin/:id',
    protect,
    requireAdmin,
    validate({ params: idParamSchema }),
    reportController.deleteReport
);

// --- User Routes ---
// GET /reports/me
router.get(
    '/me',
    protect,
    reportController.getMyReports
);

// POST /reports (multipart/form-data for image upload)
router.post(
    '/',
    protect,
    upload.single('image'),
    validate({ body: createReportSchema }),
    reportController.createReport
);

module.exports = router;

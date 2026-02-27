const asyncHandler = require('express-async-handler');
const reportService = require('../services/report.service');
const { uploadToCloudinary } = require('../utils/cloudinary');

/** POST /reports — User creates a new report */
const createReport = asyncHandler(async (req, res) => {
    let imageUrl = null;

    // Upload image to Cloudinary if provided
    if (req.file) {
        const result = await uploadToCloudinary(req.file.buffer, 'painamnae/reports');
        imageUrl = result.url;
    }

    // Parse location if sent as string (from multipart form)
    let location = req.body.location;
    if (typeof location === 'string') {
        try { location = JSON.parse(location); } catch { location = null; }
    }

    const reportData = {
        incidentType: req.body.incidentType,
        priority: req.body.priority || undefined,
        title: req.body.title,
        description: req.body.description,
        location: location || null,
        imageUrl,
        bookingId: req.body.bookingId || null,
    };

    const report = await reportService.createReport(reportData, req.user.sub);
    res.status(201).json({ success: true, message: 'Report created', data: report });
});

/** GET /reports/me — User gets their own reports */
const getMyReports = asyncHandler(async (req, res) => {
    const reports = await reportService.getMyReports(req.user.sub);
    res.json({ success: true, data: reports });
});

/** GET /reports/admin — Admin lists all reports */
const getAllReports = asyncHandler(async (req, res) => {
    const result = await reportService.getAllReports(req.query);
    res.json({ success: true, data: result.data, pagination: result.pagination });
});

/** GET /reports/admin/:id — Admin gets report by ID */
const getReportById = asyncHandler(async (req, res) => {
    const report = await reportService.getReportById(req.params.id);
    res.json({ success: true, data: report });
});

/** PUT /reports/admin/:id — Admin updates status + admin note */
const updateReportStatus = asyncHandler(async (req, res) => {
    const report = await reportService.updateReportStatus(req.params.id, req.body);
    res.json({ success: true, message: 'Report updated', data: report });
});

/** DELETE /reports/admin/:id — Admin deletes a report */
const deleteReport = asyncHandler(async (req, res) => {
    const result = await reportService.deleteReport(req.params.id);
    res.json({ success: true, message: 'Report deleted', data: result });
});

module.exports = {
    createReport,
    getMyReports,
    getAllReports,
    getReportById,
    updateReportStatus,
    deleteReport,
};

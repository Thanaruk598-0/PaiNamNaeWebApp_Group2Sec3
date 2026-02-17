const express = require('express');
const { protect, requireAdmin } = require('../middlewares/auth');
const { adminUpdateStatus } = require('../controllers/incident.controller');

const router = express.Router();

// Admin: update incident status
router.patch('/:id/status', protect, requireAdmin, adminUpdateStatus);

module.exports = router;

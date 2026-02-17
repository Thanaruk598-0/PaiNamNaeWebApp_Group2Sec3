const asyncHandler = require('express-async-handler');
const incidentService = require('../services/incident.service');
const { adminUpdateStatusSchema } = require('../validations/incident.validation');

const adminUpdateStatus = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const payload = adminUpdateStatusSchema.parse(req.body);

    const updated = await incidentService.adminUpdateStatus(id, req.user.sub, payload);
    res.status(200).json({ success: true, message: 'Incident updated', data: updated });
});

module.exports = {
    adminUpdateStatus,
};

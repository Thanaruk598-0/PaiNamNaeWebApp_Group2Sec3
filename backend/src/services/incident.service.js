const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');
const notifService = require('./notification.service');

const getIncidentById = async (id) => {
    const inc = await prisma.incident.findUnique({ where: { id } });
    if (!inc) throw new ApiError(404, 'Incident not found');
    return inc;
};

const adminUpdateStatus = async (id, adminId, payload = {}) => {
    const { status, adminNote } = payload;

    const inc = await prisma.incident.findUnique({ where: { id } });
    if (!inc) throw new ApiError(404, 'Incident not found');

    const updated = await prisma.incident.update({
        where: { id },
        data: {
            status,
            adminNote: adminNote || null,
            reviewedById: adminId,
            reviewedAt: new Date(),
        },
    });

    // notify reporter
    try {
        const title = `รายงาน: ${updated.title} - ${updated.status}`;
        const body = adminNote ? `(${adminNote})` : `สถานะ: ${updated.status}`;
        const link = `/incidents/${updated.id}`;

        await notifService.createNotificationByAdmin({
            userId: updated.reporterId,
            type: 'INCIDENT',
            title,
            body,
            link,
            metadata: { incidentId: updated.id, status: updated.status },
        });

        // also notify relatedUser if exists and different from reporter
        if (updated.relatedUserId && updated.relatedUserId !== updated.reporterId) {
            await notifService.createNotificationByAdmin({
                userId: updated.relatedUserId,
                type: 'INCIDENT',
                title,
                body,
                link,
                metadata: { incidentId: updated.id, status: updated.status },
            });
        }
    } catch (e) {
        // log but do not fail the main operation
        console.error('Failed to create incident notification', e);
    }

    return updated;
};

module.exports = {
    getIncidentById,
    adminUpdateStatus,
};

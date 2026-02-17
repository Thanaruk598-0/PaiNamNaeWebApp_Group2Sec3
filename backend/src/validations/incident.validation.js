const { z } = require('zod');
const { IncidentStatus } = require('@prisma/client');

const idParamSchema = z.object({ id: z.string().cuid({ message: 'Invalid incident ID format' }) });

const adminUpdateStatusSchema = z.object({
    status: z.nativeEnum(IncidentStatus),
    adminNote: z.string().max(2000).optional(),
});

module.exports = { idParamSchema, adminUpdateStatusSchema };

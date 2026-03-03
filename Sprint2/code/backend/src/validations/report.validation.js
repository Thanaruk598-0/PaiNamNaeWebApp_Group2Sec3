const { z } = require('zod');
const { ReportStatus, IncidentType, IncidentPriority } = require('@prisma/client');

const locationSchema = z.object({
    lat: z.number({ required_error: 'Latitude is required' }),
    lng: z.number({ required_error: 'Longitude is required' }),
    address: z.string().optional(),
}).strict();

const createReportSchema = z.object({
    incidentType: z.nativeEnum(IncidentType, {
        required_error: 'Incident type is required',
        invalid_type_error: 'Invalid incident type value',
    }),
    priority: z.nativeEnum(IncidentPriority, {
        invalid_type_error: 'Invalid priority value',
    }).optional(),
    title: z.string().min(1, 'Title is required').max(200, 'Title must be at most 200 characters'),
    description: z.string().min(1, 'Description is required').max(2000, 'Description must be at most 2000 characters'),
    location: z.union([locationSchema, z.string().transform((val) => {
        try { return JSON.parse(val); } catch { return val; }
    }).pipe(locationSchema)]),
    bookingId: z.string().cuid({ message: 'Invalid booking ID format' }).optional().nullable(),
    attachments: z.any().optional(),
});

const updateReportStatusSchema = z.object({
    status: z.nativeEnum(ReportStatus, {
        required_error: 'Status is required',
        invalid_type_error: 'Invalid status value',
    }),
    adminNote: z.string().max(2000).optional().nullable(),
});

const listReportsQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    q: z.string().trim().min(1).optional(),
    status: z.nativeEnum(ReportStatus).optional(),
    incidentType: z.nativeEnum(IncidentType).optional(),
    priority: z.nativeEnum(IncidentPriority).optional(),
    sortBy: z.enum(['createdAt', 'status', 'incidentType', 'priority']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

const idParamSchema = z.object({
    id: z.string().cuid({ message: 'Invalid report ID format' }),
});

module.exports = {
    createReportSchema,
    updateReportStatusSchema,
    listReportsQuerySchema,
    idParamSchema,
};

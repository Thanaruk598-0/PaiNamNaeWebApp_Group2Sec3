const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');

/** User: create a new report */
const createReport = async (data, userId) => {
    // Validate bookingId belongs to the user (as passenger or driver)
    if (data.bookingId) {
        const booking = await prisma.booking.findUnique({
            where: { id: data.bookingId },
            include: { route: { select: { driverId: true } } },
        });
        if (!booking) {
            throw new ApiError(404, 'Booking not found');
        }
        // User must be the passenger or the driver of this booking
        if (booking.passengerId !== userId && booking.route.driverId !== userId) {
            throw new ApiError(403, 'You are not associated with this booking');
        }
    }

    const report = await prisma.report.create({
        data: {
            userId,
            bookingId: data.bookingId || null,
            incidentType: data.incidentType,
            priority: data.priority || 'MEDIUM',
            title: data.title,
            description: data.description,
            location: data.location,
            attachments: data.attachments || null,
        },
        include: {
            user: {
                select: { id: true, firstName: true, lastName: true, email: true },
            },
            booking: {
                include: {
                    route: {
                        select: {
                            id: true,
                            startLocation: true,
                            endLocation: true,
                            departureTime: true,
                            routeSummary: true,
                        },
                    },
                },
            },
        },
    });

    // Send notification to all admins
    try {
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: { id: true },
        });

        if (admins.length > 0) {
            await prisma.notification.createMany({
                data: admins.map((admin) => ({
                    userId: admin.id,
                    type: 'SYSTEM',
                    title: 'มีรายงานเหตุการณ์ใหม่',
                    body: `${report.user.firstName || 'ผู้ใช้'} ${report.user.lastName || ''} แจ้ง: ${report.title}`,
                    link: `/admin/reports/${report.id}`,
                    metadata: {
                        kind: 'NEW_REPORT',
                        reportId: report.id,
                        incidentType: report.incidentType,
                        priority: report.priority,
                    },
                })),
            });
        }
    } catch (err) {
        console.error('Failed to notify admins about new report:', err);
    }

    return report;
};

/** User: get my reports */
const getMyReports = async (userId) => {
    return prisma.report.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
            user: {
                select: { id: true, firstName: true, lastName: true, email: true },
            },
            booking: {
                include: {
                    passenger: {
                        select: { id: true, firstName: true, lastName: true, email: true, profilePicture: true },
                    },
                    route: {
                        select: {
                            id: true,
                            startLocation: true,
                            endLocation: true,
                            departureTime: true,
                            routeSummary: true,
                            driver: {
                                select: { id: true, firstName: true, lastName: true, email: true, profilePicture: true },
                            },
                        },
                    },
                },
            },
        },
    });
};

/** Admin: search/list all reports */
const getAllReports = async (opts = {}) => {
    const {
        page = 1,
        limit = 20,
        q,
        status,
        incidentType,
        priority,
        sortBy = 'createdAt',
        sortOrder = 'desc',
    } = opts;

    const where = {
        ...(status && { status }),
        ...(incidentType && { incidentType }),
        ...(priority && { priority }),
        ...(q
            ? {
                OR: [
                    { title: { contains: q, mode: 'insensitive' } },
                    { description: { contains: q, mode: 'insensitive' } },
                    {
                        user: {
                            OR: [
                                { firstName: { contains: q, mode: 'insensitive' } },
                                { lastName: { contains: q, mode: 'insensitive' } },
                                { email: { contains: q, mode: 'insensitive' } },
                            ],
                        },
                    },
                ],
            }
            : {}),
    };

    const skip = (page - 1) * limit;
    const take = limit;

    const [total, data] = await prisma.$transaction([
        prisma.report.count({ where }),
        prisma.report.findMany({
            where,
            orderBy: { [sortBy]: sortOrder },
            skip,
            take,
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        username: true,
                        profilePicture: true,
                        phoneNumber: true,
                    },
                },
                booking: {
                    include: {
                        passenger: {
                            select: { id: true, firstName: true, lastName: true, email: true, profilePicture: true, phoneNumber: true },
                        },
                        route: {
                            select: {
                                id: true,
                                startLocation: true,
                                endLocation: true,
                                departureTime: true,
                                routeSummary: true,
                                driver: {
                                    select: { id: true, firstName: true, lastName: true, email: true, profilePicture: true, phoneNumber: true },
                                },
                            },
                        },
                    },
                },
            },
        }),
    ]);

    return {
        data,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/** Admin: get single report by ID */
const getReportById = async (id) => {
    const report = await prisma.report.findUnique({
        where: { id },
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    username: true,
                    profilePicture: true,
                    phoneNumber: true,
                },
            },
            booking: {
                include: {
                    route: {
                        select: {
                            id: true,
                            startLocation: true,
                            endLocation: true,
                            departureTime: true,
                            routeSummary: true,
                            status: true,
                            driver: {
                                select: { id: true, firstName: true, lastName: true, email: true, profilePicture: true, phoneNumber: true },
                            },
                        },
                    },
                    passenger: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            profilePicture: true,
                            phoneNumber: true,
                        },
                    },
                },
            },
        },
    });
    if (!report) throw new ApiError(404, 'Report not found');
    return report;
};

/** Admin: update report status + admin note */
const updateReportStatus = async (id, patch) => {
    const existing = await prisma.report.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, 'Report not found');

    const updated = await prisma.report.update({
        where: { id },
        data: {
            status: patch.status,
            adminNote: patch.adminNote !== undefined ? patch.adminNote : existing.adminNote,
        },
        include: {
            user: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    username: true,
                    profilePicture: true,
                    phoneNumber: true,
                },
            },
        },
    });

    // Notify user about status change
    try {
        if (updated.userId) {
            let messageBody = `สถานะรายงานของคุณเปลี่ยนเป็น ${updated.status}`;
            if (patch.adminNote) {
                messageBody += ` (หมายเหตุ: ${patch.adminNote})`;
            }

            await prisma.notification.create({
                data: {
                    userId: updated.userId,
                    type: 'SYSTEM',
                    title: 'อัปเดตสถานะรายงาน',
                    body: messageBody,
                    link: `/myReports`, // Direct to myReports list or specific detail if available
                    metadata: {
                        kind: 'REPORT_UPDATE',
                        reportId: updated.id,
                        status: updated.status,
                    },
                },
            });

            const io = require('../socket').getIO();
            if (io) {
                io.to(`user:${updated.userId}`).emit('new_notification', {
                    title: 'อัปเดตสถานะรายงาน',
                    body: messageBody,
                    link: `/myReports`,
                    createdAt: new Date(),
                    metadata: {
                        kind: 'REPORT_UPDATE',
                        reportId: updated.id,
                        status: updated.status,
                    },
                });
            }
        }
    } catch (err) {
        console.error('Failed to notify user about report update:', err);
    }

    return updated;
};

/** Admin: delete a report */
const deleteReport = async (id) => {
    const existing = await prisma.report.findUnique({ where: { id } });
    if (!existing) throw new ApiError(404, 'Report not found');
    await prisma.report.delete({ where: { id } });
    return { id };
};

module.exports = {
    createReport,
    getMyReports,
    getAllReports,
    getReportById,
    updateReportStatus,
    deleteReport,
};

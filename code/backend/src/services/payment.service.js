const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');
const { PaymentStatus, PaymentChannel } = require('@prisma/client');
const documentService = require('./document.service');
const { uploadToCloudinary } = require('../utils/cloudinary');

const getBookingWithRelations = async (bookingId) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      route: {
        include: {
          driver: true,
        },
      },
      passenger: true,
      payment: true,
    },
  });
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }
  return booking;
};

const getPaymentByBooking = async (bookingId, userId) => {
  const booking = await getBookingWithRelations(bookingId);

  if (booking.passengerId !== userId && booking.route.driverId !== userId) {
    throw new ApiError(403, 'Forbidden');
  }

  if (!booking.payment) {
    return null;
  }

  const payment = await prisma.payment.findUnique({
    where: { id: booking.payment.id },
    include: {
      documents: true,
    },
  });

  return payment;
};

const ensureCanDeclarePayment = (booking, passengerId) => {
  if (booking.passengerId !== passengerId) {
    throw new ApiError(403, 'Forbidden');
  }
  if (booking.status !== 'CONFIRMED') {
    throw new ApiError(400, 'Cannot declare payment for this booking status');
  }
};

const createOrUpdatePaymentBase = async (tx, { booking, passengerId, channel }) => {
  const existing = await tx.payment.findUnique({
    where: { bookingId: booking.id },
  });

  const amount = booking.numberOfSeats * booking.route.pricePerSeat;

  if (existing) {
    return tx.payment.update({
      where: { id: existing.id },
      data: {
        amount,
        channel,
        status: PaymentStatus.PENDING_CHECK,
        declaredAt: new Date(),
      },
    });
  }

  return tx.payment.create({
    data: {
      booking: { connect: { id: booking.id } },
      passenger: { connect: { id: passengerId } },
      driver: { connect: { id: booking.route.driverId } },
      amount,
      channel,
      status: PaymentStatus.PENDING_CHECK,
      declaredAt: new Date(),
    },
  });
};

const submitPaymentSlip = async (bookingId, passengerId, file, method) => {
  const booking = await getBookingWithRelations(bookingId);
  ensureCanDeclarePayment(booking, passengerId);

  const channel = method && PaymentChannel[method] ? method : PaymentChannel.BANK_TRANSFER;

  return prisma.$transaction(async (tx) => {
    const uploadResult = await uploadToCloudinary(file.buffer, 'payments/slips');

    const payment = await createOrUpdatePaymentBase(tx, {
      booking,
      passengerId,
      channel,
    });

    const updated = await tx.payment.update({
      where: { id: payment.id },
      data: {
        slipImageUrl: uploadResult.url,
      },
      include: {
        booking: true,
        passenger: true,
        driver: true,
      },
    });

    return updated;
  });
};

const declareCashPayment = async (bookingId, passengerId) => {
  const booking = await getBookingWithRelations(bookingId);
  ensureCanDeclarePayment(booking, passengerId);

  const payment = await prisma.$transaction(async (tx) => {
    const base = await createOrUpdatePaymentBase(tx, {
      booking,
      passengerId,
      channel: PaymentChannel.CASH,
    });

    // ให้คนขับยืนยัน (รอตรวจสอบ)
    const updated = await tx.payment.update({
      where: { id: base.id },
      data: {
        slipImageUrl: null,
      },
      include: {
        booking: true,
        passenger: true,
        driver: true,
      },
    });

    return updated;
  });

  return payment;
};

const verifyPayment = async (bookingId, driverId, { method }) => {
  const booking = await getBookingWithRelations(bookingId);

  if (booking.route.driverId !== driverId) {
    throw new ApiError(403, 'Forbidden');
  }

  if (!booking.payment) {
    throw new ApiError(400, 'No payment declaration for this booking');
  }

  const channel = method && PaymentChannel[method] ? method : booking.payment.channel;

  const payment = await prisma.payment.update({
    where: { id: booking.payment.id },
    data: {
      status: PaymentStatus.PAID,
      channel,
      verifiedAt: new Date(),
    },
    include: {
      booking: true,
      passenger: true,
      driver: true,
    },
  });

  return payment;
};

const rejectPayment = async (bookingId, driverId, rejectReason) => {
  const booking = await getBookingWithRelations(bookingId);

  if (booking.route.driverId !== driverId) {
    throw new ApiError(403, 'Forbidden');
  }

  if (!booking.payment) {
    throw new ApiError(400, 'No payment declaration for this booking');
  }

  const payment = await prisma.payment.update({
    where: { id: booking.payment.id },
    data: {
      status: PaymentStatus.FAILED,
      rejectReason: rejectReason || null,
    },
    include: {
      booking: true,
      passenger: true,
      driver: true,
    },
  });

  return payment;
};

const listDriverPaidPassengers = async (driverId, opts = {}) => {
  const { routeId } = opts;

  const where = {
    driverId,
    status: PaymentStatus.PAID,
    ...(routeId ? { booking: { routeId } } : {}),
  };

  const payments = await prisma.payment.findMany({
    where,
    include: {
      booking: {
        include: {
          route: true,
          passenger: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              username: true,
            },
          },
        },
      },
      documents: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return payments;
};

module.exports = {
  getPaymentByBooking,
  submitPaymentSlip,
  declareCashPayment,
  verifyPayment,
  rejectPayment,
  listDriverPaidPassengers,
};


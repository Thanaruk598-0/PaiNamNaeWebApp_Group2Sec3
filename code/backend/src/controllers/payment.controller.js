const asyncHandler = require('express-async-handler');
const paymentService = require('../services/payment.service');
const documentService = require('../services/document.service');
const ApiError = require('../utils/ApiError');

const getPayment = asyncHandler(async (req, res) => {
  const userId = req.user.sub;
  const data = await paymentService.getPaymentByBooking(req.params.id, userId);
  res.status(200).json({ success: true, message: 'Payment retrieved successfully', data });
});

const submitPaymentSlip = asyncHandler(async (req, res) => {
  const passengerId = req.user.sub;
  if (!req.file) throw new ApiError(400, 'Payment slip image is required');
  const { method } = req.body;
  const data = await paymentService.submitPaymentSlip(req.params.id, passengerId, req.file, method);
  res.status(200).json({ success: true, message: 'Payment slip submitted successfully', data });
});

const verifyPayment = asyncHandler(async (req, res) => {
  const driverId = req.user.sub;
  const { method } = req.body;
  const payment = await paymentService.verifyPayment(req.params.id, driverId, { method });

  await documentService.ensureDocumentsForPayment(payment.id);

  res.status(200).json({ success: true, message: 'Payment verified successfully', data: payment });
});

const rejectPayment = asyncHandler(async (req, res) => {
  const driverId = req.user.sub;
  const { rejectReason } = req.body;
  const data = await paymentService.rejectPayment(req.params.id, driverId, rejectReason);
  res.status(200).json({ success: true, message: 'Payment rejected', data });
});

const declareCashPayment = asyncHandler(async (req, res) => {
  const passengerId = req.user.sub;
  const payment = await paymentService.declareCashPayment(req.params.id, passengerId);
  res.status(200).json({ success: true, message: 'Cash payment declared', data: payment });
});

const listDriverPaidPassengers = asyncHandler(async (req, res) => {
  const driverId = req.user.sub;
  const { routeId } = req.query;
  const data = await paymentService.listDriverPaidPassengers(driverId, { routeId });
  res.status(200).json({ success: true, message: 'Driver paid passengers retrieved', data });
});

const getPaymentDocuments = asyncHandler(async (req, res) => {
  const userId = req.user.sub;
  const paymentId = req.params.id;
  const data = await documentService.getPaymentDocumentsForUser(paymentId, userId);
  res.status(200).json({ success: true, message: 'Payment documents retrieved', data });
});

const downloadReceiptVoucher = asyncHandler(async (req, res) => {
  const userId = req.user.sub;
  const paymentId = req.params.id;
  await documentService.streamReceiptVoucher(paymentId, userId, res);
});

const downloadShortTaxInvoice = asyncHandler(async (req, res) => {
  const userId = req.user.sub;
  const paymentId = req.params.id;
  await documentService.streamShortTaxInvoice(paymentId, userId, res);
});

module.exports = {
  getPayment,
  submitPaymentSlip,
  declareCashPayment,
  verifyPayment,
  rejectPayment,
  listDriverPaidPassengers,
  getPaymentDocuments,
  downloadReceiptVoucher,
  downloadShortTaxInvoice,
};

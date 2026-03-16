const express = require('express');
const upload = require('../middlewares/upload.middleware');
const { protect } = require('../middlewares/auth');
const validate = require('../middlewares/validate');
const paymentController = require('../controllers/payment.controller');
const { idParamSchema } = require('../validations/booking.validation');

const router = express.Router();

// GET /payments/booking/:id - get payment info for a booking
router.get(
  '/booking/:id',
  protect,
  validate({ params: idParamSchema }),
  paymentController.getPayment
);

// POST /payments/booking/:id/slip - passenger uploads payment slip
router.post(
  '/booking/:id/slip',
  protect,
  validate({ params: idParamSchema }),
  upload.single('slip'),
  paymentController.submitPaymentSlip
);

// POST /payments/booking/:id/cash - passenger declares cash payment
router.post(
  '/booking/:id/cash',
  protect,
  validate({ params: idParamSchema }),
  paymentController.declareCashPayment
);

// POST /payments/booking/:id/verify - driver verifies payment
router.post(
  '/booking/:id/verify',
  protect,
  validate({ params: idParamSchema }),
  paymentController.verifyPayment
);

// POST /payments/booking/:id/reject - driver rejects payment
router.post(
  '/booking/:id/reject',
  protect,
  validate({ params: idParamSchema }),
  paymentController.rejectPayment
);

// GET /payments/driver - driver view list of paid passengers (optionally by route)
router.get(
  '/driver',
  protect,
  paymentController.listDriverPaidPassengers
);

// --- Documents ---

// GET /payments/:id/documents - metadata for documents
router.get(
  '/:id/documents',
  protect,
  paymentController.getPaymentDocuments
);

// POST /payments/:id/regenerate - force regenerate all documents
router.post(
  '/:id/regenerate',
  protect,
  paymentController.regenerateDocuments
);

// GET /payments/:id/receipt-voucher - stream receipt voucher PDF
router.get(
  '/:id/receipt-voucher',
  protect,
  paymentController.downloadReceiptVoucher
);

// GET /payments/:id/short-tax-invoice - stream short tax invoice PDF
router.get(
  '/:id/short-tax-invoice',
  protect,
  paymentController.downloadShortTaxInvoice
);

module.exports = router;


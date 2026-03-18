const express = require('express');
const validate = require('../middlewares/validate');
const { protect } = require('../middlewares/auth');
const upload = require('../middlewares/upload.middleware');
const paymentMethodController = require('../controllers/paymentMethod.controller');
const {
  updatePromptPaySchema,
  createBankAccountSchema,
  updateBankAccountSchema,
  bankAccountIdParamSchema,
} = require('../validations/paymentMethod.validation');

const router = express.Router();

// GET /api/payment-methods/me - get promptpay + bank accounts
router.get('/me', protect, paymentMethodController.getPaymentInfo);

// PUT /api/payment-methods/promptpay - update promptpay
router.put(
  '/promptpay',
  protect,
  validate({ body: updatePromptPaySchema }),
  paymentMethodController.updatePromptPay
);

// PUT /api/payment-methods/promptpay-qr - upload promptpay QR (image/pdf)
router.put(
  '/promptpay-qr',
  protect,
  upload.fields([
    { name: 'qr', maxCount: 1 },
    { name: 'file', maxCount: 1 },
    { name: 'promptPayQr', maxCount: 1 },
  ]),
  paymentMethodController.updatePromptPayQr
);

// POST /api/payment-methods/bank-accounts - add bank account
router.post(
  '/bank-accounts',
  protect,
  validate({ body: createBankAccountSchema }),
  paymentMethodController.addBankAccount
);

// PUT /api/payment-methods/bank-accounts/:id - update bank account
router.put(
  '/bank-accounts/:id',
  protect,
  validate({ params: bankAccountIdParamSchema, body: updateBankAccountSchema }),
  paymentMethodController.updateBankAccount
);

// DELETE /api/payment-methods/bank-accounts/:id - delete bank account
router.delete(
  '/bank-accounts/:id',
  protect,
  validate({ params: bankAccountIdParamSchema }),
  paymentMethodController.deleteBankAccount
);

module.exports = router;


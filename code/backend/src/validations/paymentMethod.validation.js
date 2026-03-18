const { z } = require('zod');

const getPaymentInfoQuerySchema = z.object({});

const updatePromptPaySchema = z.object({
  promptPayId: z
    .string()
    .trim()
    .min(1, 'กรุณากรอก PromptPay')
    .max(100, 'PromptPayยาวเกินไป'),
});

const createBankAccountSchema = z.object({
  bankCode: z.string().trim().min(1, 'กรุณาเลือกธนาคาร').max(50),
  customBankName: z.string().trim().max(100).optional().nullable(),
  accountNumber: z
    .string()
    .trim()
    .min(1, 'กรุณากรอกเลขที่บัญชี')
    .max(50, 'เลขที่บัญชียาวเกินไป'),
  accountName: z
    .string()
    .trim()
    .min(1, 'กรุณากรอกชื่อบัญชี')
    .max(150, 'ชื่อบัญชียาวเกินไป'),
});

const updateBankAccountSchema = createBankAccountSchema;

const bankAccountIdParamSchema = z.object({
  id: z.string().cuid({ message: 'Invalid bank account ID format' }),
});

module.exports = {
  getPaymentInfoQuerySchema,
  updatePromptPaySchema,
  createBankAccountSchema,
  updateBankAccountSchema,
  bankAccountIdParamSchema,
};


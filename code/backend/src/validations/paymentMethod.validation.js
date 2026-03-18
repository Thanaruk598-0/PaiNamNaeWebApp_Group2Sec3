const { z } = require('zod');

const getPaymentInfoQuerySchema = z.object({});

const updatePromptPaySchema = z.object({
  promptPayId: z
    .string()
    .trim()
    .min(1, 'กรุณากรอก PromptPay')
    .max(13, 'PromptPay ต้องไม่เกิน 13 หลัก')
    .regex(/^\d+$/, 'PromptPay ต้องเป็นตัวเลขเท่านั้น'),
});

const createBankAccountSchema = z.object({
  bankCode: z.string().trim().min(1, 'กรุณาเลือกธนาคาร').max(50),
  customBankName: z.string().trim().max(100).optional().nullable(),
  accountNumber: z
    .string()
    .trim()
    .min(10, 'เลขที่บัญชีต้องมีอย่างน้อย 10 หลัก')
    .max(12, 'เลขที่บัญชีต้องไม่เกิน 12 หลัก')
    .regex(/^\d+$/, 'เลขที่บัญชีต้องเป็นตัวเลขเท่านั้น'),
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


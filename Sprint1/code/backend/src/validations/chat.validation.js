const { z } = require('zod');

const sendMessageSchema = z.object({
    body: z.object({
        content: z.string().min(1, 'ข้อความต้องไม่เป็นค่าว่าง').max(5000, 'ข้อความยาวเกิน 5000 ตัวอักษร'),
    }),
});

module.exports = {
    sendMessageSchema,
};

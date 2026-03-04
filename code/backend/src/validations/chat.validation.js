const { z } = require('zod');

const sendMessageSchema = z.object({
    body: z.object({
        content: z.string().max(5000, 'ข้อความยาวเกิน 5000 ตัวอักษร').optional().default(''),
    }),
});

module.exports = {
    sendMessageSchema,
};

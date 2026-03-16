const asyncHandler = require('express-async-handler');
const prisma = require('../utils/prisma');

exports.getPaymentInfo = asyncHandler(async (req, res) => {
    const userId = req.user.sub; 

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { bankAccounts: true }
    });

    res.json({
        promptPayId: user.promptPayId,
        bankAccounts: user.bankAccounts
    });
});

exports.updatePromptPay = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const { promptPayId } = req.body;

    await prisma.user.update({
        where: { id: userId },
        data: { promptPayId }
    });

    res.json({ success: true, promptPayId });
});


exports.addBankAccount = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const { bankCode, customBankName, accountNumber, accountName } = req.body;

    const newAccount = await prisma.bankAccount.create({
        data: {
            userId,
            bankCode,
            customBankName,
            accountNumber,
            accountName
        }
    });

    res.status(201).json(newAccount);
});


exports.updateBankAccount = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { bankCode, customBankName, accountNumber, accountName } = req.body;


    const account = await prisma.bankAccount.findUnique({ where: { id } });
    if (!account || account.userId !== req.user.sub) {
        res.status(403);
        throw new Error('ไม่ได้รับอนุญาตให้แก้ไขบัญชีนี้');
    }

    const updatedAccount = await prisma.bankAccount.update({
        where: { id },
        data: { bankCode, customBankName, accountNumber, accountName }
    });

    res.json(updatedAccount);
});


exports.deleteBankAccount = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const account = await prisma.bankAccount.findUnique({ where: { id } });
    if (!account || account.userId !== req.user.sub) {
        res.status(403);
        throw new Error('ไม่ได้รับอนุญาตให้ลบบัญชีนี้');
    }

    await prisma.bankAccount.delete({ where: { id } });
    res.json({ success: true, message: 'ลบบัญชีเรียบร้อยแล้ว' });
});
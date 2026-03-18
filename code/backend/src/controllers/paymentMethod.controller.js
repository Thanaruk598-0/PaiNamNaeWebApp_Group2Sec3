const asyncHandler = require('express-async-handler');
const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');
const { uploadToCloudinary } = require('../utils/cloudinary');

const getDisplayName = (u) => {
    const name = `${u?.firstName || ''} ${u?.lastName || ''}`.trim();
    return name || u?.username || u?.email || 'ผู้ใช้';
};

exports.getPaymentInfo = asyncHandler(async (req, res) => {
    const userId = req.user.sub; 

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { bankAccounts: true }
    });

    res.json({
        ownerName: getDisplayName(user),
        promptPayId: user.promptPayId,
        promptPayQrUrl: user.promptPayQrUrl,
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

exports.updatePromptPayQr = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    if (!req.file) throw new ApiError(400, 'QR file is required');

    const uploadResult = await uploadToCloudinary(req.file.buffer, 'payments/promptpay-qr');

    const user = await prisma.user.update({
        where: { id: userId },
        data: { promptPayQrUrl: uploadResult.url },
        select: { promptPayQrUrl: true },
    });

    res.json({ success: true, promptPayQrUrl: user.promptPayQrUrl });
});


exports.addBankAccount = asyncHandler(async (req, res) => {
    const userId = req.user.sub;
    const { bankCode, customBankName, accountNumber } = req.body;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { firstName: true, lastName: true, username: true, email: true },
    });
    const accountName = getDisplayName(user);

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
    const { bankCode, customBankName, accountNumber } = req.body;


    const account = await prisma.bankAccount.findUnique({ where: { id } });
    if (!account || account.userId !== req.user.sub) {
        res.status(403);
        throw new Error('ไม่ได้รับอนุญาตให้แก้ไขบัญชีนี้');
    }

    const user = await prisma.user.findUnique({
        where: { id: req.user.sub },
        select: { firstName: true, lastName: true, username: true, email: true },
    });
    const accountName = getDisplayName(user);

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
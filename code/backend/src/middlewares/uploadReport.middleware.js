const multer = require('multer');

// กำหนดค่า Multer ให้เก็บไฟล์ใน memoryชั่วคราวเพื่อรอส่งต่อไปยัง Cloudinary
const storage = multer.memoryStorage();

const MB = 1024 * 1024;
const SIZE_LIMITS = {
    image: 10 * MB,
    video: 100 * MB,
    audio: 100 * MB,
    pdf: 10 * MB,
};

const getFileCategory = (mimetype = '') => {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.startsWith('audio/')) return 'audio';
    if (mimetype === 'application/pdf') return 'pdf';
    return null;
};

const fileFilter = (req, file, cb) => {
    if (getFileCategory(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image, video, audio, and PDF files are allowed'), false);
    }
};

const uploadReport = multer({
    storage,
    fileFilter,
    // Multer limit is the upper bound; detailed per-type checks are done below.
    limits: { fileSize: SIZE_LIMITS.video }
});

uploadReport.validateAttachmentSizes = (req, res, next) => {
    if (!Array.isArray(req.files) || req.files.length === 0) {
        return next();
    }

    for (const file of req.files) {
        const category = getFileCategory(file.mimetype);
        const limit = category ? SIZE_LIMITS[category] : 0;

        if (!category || !limit) {
            return next(new Error('Only image, video, audio, and PDF files are allowed'));
        }

        if (file.size > limit) {
            const maxSizeMb = limit / MB;
            return next(new Error(`${category.toUpperCase()} file size must not exceed ${maxSizeMb} MB`));
        }
    }

    return next();
};

module.exports = uploadReport;
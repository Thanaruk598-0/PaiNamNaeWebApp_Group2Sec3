const multer = require('multer');
const ApiError = require('../utils/ApiError');

const storage = multer.memoryStorage();

const chatUpload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // จำกัด 10 MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new ApiError(400, 'รองรับเฉพาะไฟล์รูปภาพเท่านั้น (jpeg, png, gif, webp)'), false);
        }
    },
});

module.exports = chatUpload;


// server/middleware/uploadMiddleware.js
const multer = require('multer');

// We use memory storage so the file is held in RAM temporarily 
// instead of saving it to the hard drive. We will pass it directly to Python.
const storage = multer.memoryStorage();

// File filter to accept PDFs, Word docs, and common image types
const allowedMimeTypes = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg'
]);

const fileFilter = (req, file, cb) => {
    if (allowedMimeTypes.has(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type. Please upload a PDF, DOCX, PNG, or JPG.'), false);
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit (from your SRS)
    fileFilter
});

module.exports = upload;

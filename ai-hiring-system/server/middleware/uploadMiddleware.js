// server/middleware/uploadMiddleware.js
const multer = require('multer');

// We use memory storage so the file is held in RAM temporarily 
// instead of saving it to the hard drive. We will pass it directly to Python.
const storage = multer.memoryStorage();

// File filter to ONLY accept PDFs or Word docs
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf' || 
        file.mimetype === 'application/msword' || 
        file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        cb(null, true);
    } else {
        cb(new Error('Unsupported file type. Please upload a PDF or DOCX.'), false);
    }
};

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit (from your SRS)
    fileFilter
});

module.exports = upload;

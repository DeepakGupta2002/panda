const multer = require('multer');
const path = require('path');

// Set up Multer for storing images in the 'uploads' folder
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Directory to save the images
    },
    filename: (req, file, cb) => {
        // Using the original file name along with a timestamp to avoid conflicts
        cb(null, `${Date.now()}_${file.originalname}`);
    }
});

// Filter to allow only image files (optional)
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

// Initialize Multer
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // Maximum file size 10MB
});

module.exports = { upload };

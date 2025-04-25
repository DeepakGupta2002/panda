const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');
require("dotenv/config")

// ✅ Cloudinary Config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// ✅ Allowed File Types
const allowedFormats = ['jpeg', 'jpg', 'png', 'gif', 'webp'];

// ✅ Multer-Cloudinary Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const fileExt = file.mimetype.split('/')[1]; // Extract extension
        if (!allowedFormats.includes(fileExt)) {
            throw new Error("Only JPEG, JPG, PNG, GIF, WEBP files are allowed!");
        }

        return {
            folder: 'aadhaar-pan-cards', // ✅ Cloudinary Folder
            allowed_formats: allowedFormats,
            public_id: `${Date.now()}-${file.originalname}`,
            transformation: [{ width: 600, height: 400, crop: "limit", quality: "auto" }] // ✅ Optimize Image
        };
    }
});

// ✅ Multer Middleware with File Size Limit
const uploadToCloudinary = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // ✅ 5MB File Size Limit
    fileFilter: (req, file, cb) => {
        if (!file) {
            return cb(new Error('No file uploaded!'));
        }
        cb(null, true);
    }
});

module.exports = { uploadToCloudinary, cloudinary };



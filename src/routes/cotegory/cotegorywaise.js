const express = require('express');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const { Category } = require('../../models/cotegory');
const validateCategory = require('../../middleware/validateCategory');
const cloudinary = require('cloudinary').v2;

const cotegoryRouter = express.Router();

// Multer configuration for file upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');  // Folder to save the image temporarily
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));  // Unique filename
    }
});

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const upload = multer({ storage });  // Multer instance for file upload

// Create a new category
cotegoryRouter.post('/categories', upload.single('image'), validateCategory, async (req, res) => {
    try {
        // Resize the image using Sharp before uploading to Cloudinary
        const resizedImagePath = 'uploads/resized-' + req.file.filename;

        // Resize the image to ensure it doesn't exceed a maximum pixel size (e.g., 2000x2000)
        const image = sharp(req.file.path);
        const metadata = await image.metadata();
        const maxWidth = 2000;  // Max width in pixels
        const maxHeight = 2000; // Max height in pixels

        // If image exceeds max width or height, resize it
        if (metadata.width > maxWidth || metadata.height > maxHeight) {
            await image
                .resize(maxWidth, maxHeight, { fit: 'inside' })  // Resizing while maintaining aspect ratio
                .toFile(resizedImagePath);
        } else {
            // If image size is within the limit, just copy the image
            await image.toFile(resizedImagePath);
        }

        // Upload the resized image to Cloudinary
        const result = await cloudinary.uploader.upload(resizedImagePath);

        // Save category with Cloudinary image URL
        const category = new Category({
            name: req.body.name,
            imageUrl: result.secure_url,  // Cloudinary image URL
        });

        // Save category to database
        await category.save();

        // Delete the original and resized images from the local server after upload
        const fs = require('fs');
        fs.unlinkSync(req.file.path);  // Delete the original file
        fs.unlinkSync(resizedImagePath);  // Delete the resized image

        res.status(201).json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});


// Get all categories
cotegoryRouter.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single category by ID
cotegoryRouter.get('/categories/:id', async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });
        res.status(200).json(category);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a category by ID
cotegoryRouter.put('/categories/:id', upload.single('image'), validateCategory, async (req, res) => {
    try {
        const categoryData = req.body;
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path);
            categoryData.imageUrl = result.secure_url;  // Cloudinary image URL
            const fs = require('fs');
            fs.unlinkSync(req.file.path);  // Delete file from local folder
        }

        const category = await Category.findByIdAndUpdate(req.params.id, categoryData, { new: true, runValidators: true });
        if (!category) return res.status(404).json({ message: 'Category not found' });

        res.status(200).json(category);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a category by ID
cotegoryRouter.delete('/categories/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndDelete(req.params.id);
        if (!category) return res.status(404).json({ message: 'Category not found' });

        // Delete image from Cloudinary
        const publicId = category.imageUrl.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(publicId);  // Remove image from Cloudinary

        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = { cotegoryRouter };

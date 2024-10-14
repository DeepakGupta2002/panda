const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const tiffinCategory = require('../models/tiffinCategory');
require("dotenv/config")

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Multer storage setup for Cloudinary
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'tiffin_categories',
        allowedFormats: ['jpg', 'png', 'jpeg'],
        transformation: [{ width: 500, height: 500, crop: 'limit' }]
    }
});

// Initialize multer with Cloudinary storage
const upload = multer({ storage: storage });

// 1. Create a new tiffin category with image upload
router.post('/tiffin-categories', upload.single('image'), async (req, res) => {
    try {
        console.log(req.body);
        console.log(req.file);

        const { name, price, description } = req.body;

        const newCategory = new tiffinCategory({
            name,
            price,
            description,
            imageUrl: req.file.path // Store the image URL from Cloudinary
        });

        await newCategory.save();
        res.status(201).json({ message: "Tiffin category created successfully", category: newCategory });
    } catch (err) {
        res.status(500).json({ error: "Failed to create tiffin category", err: err.message });
    }
});

// 2. Fetch all tiffin categories (Read all)
router.get('/tiffin-categories', async (req, res) => {
    try {
        const categories = await tiffinCategory.find();
        res.status(200).json(categories);
    } catch (err) {
        res.status(500).json({ error: "Something went wrong" });
    }
});

// 3. Fetch a single tiffin category by ID (Read one)
router.get('/tiffin-categories/:id', async (req, res) => {
    try {
        const category = await tiffinCategory.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ error: "Tiffin category not found" });
        }
        res.status(200).json(category);
    } catch (err) {
        res.status(500).json({ error: "Something went wrong" });
    }
});

// 4. Update a tiffin category by ID (Update)
router.put('/tiffin-categories/:id', upload.single('image'), async (req, res) => {
    try {
        const { name, price, description } = req.body;

        const updatedCategory = await tiffinCategory.findByIdAndUpdate(
            req.params.id,
            {
                name,
                price,
                description,
                imageUrl: req.file ? req.file.path : undefined // Update image only if new file uploaded
            },
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ error: "Tiffin category not found" });
        }

        res.status(200).json({ message: "Tiffin category updated successfully", category: updatedCategory });
    } catch (err) {
        res.status(500).json({ error: "Failed to update tiffin category" });
    }
});

// 5. Delete a tiffin category by ID (Delete)
router.delete('/tiffin-categories/:id', async (req, res) => {
    try {
        const deletedCategory = await tiffinCategory.findByIdAndDelete(req.params.id);

        if (!deletedCategory) {
            return res.status(404).json({ error: "Tiffin category not found" });
        }

        res.status(200).json({ message: "Tiffin category deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete tiffin category" });
    }
});

module.exports = { router };

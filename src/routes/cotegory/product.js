const express = require('express');
const multer = require('multer');
const path = require('path');
const { Product } = require('../../models/Product');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const productRouter = express.Router();
const mongoose = require('mongoose');

// Setup Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Setup Multer for image uploading
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');  // Set the destination folder for uploaded files
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Set the file name to be unique
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png|gif/;
        const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = fileTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        }
        cb('Error: Images Only!');
    }
}).array('images', 5); // Limit to 5 images at a time

// Create a new product with images

productRouter.post('/products', upload, async (req, res) => {
    const { name, description, price, categoryId } = req.body;

    // Ensure files are uploaded
    const imageFiles = req.files || [];
    if (imageFiles.length === 0) {
        return res.status(400).json({ message: 'No images uploaded' });
    }

    try {
        // Upload images to Cloudinary and get their URLs
        const imagePromises = imageFiles.map(file => {
            return new Promise((resolve, reject) => {
                cloudinary.uploader.upload(file.path, { resource_type: 'image' }, (err, result) => {
                    if (err) {
                        console.error(`Cloudinary Upload Error for file ${file.path}:`, err);
                        reject(new Error('Image upload failed'));
                    } else if (!result || !result.secure_url) {
                        console.error(`Invalid Cloudinary response for file ${file.path}:`, result);
                        reject(new Error('Invalid response from Cloudinary'));
                    } else {
                        resolve(result.secure_url);
                    }
                });
            });
        });

        const imageUrls = await Promise.all(imagePromises);

        // Delete local files after upload
        imageFiles.forEach(file => {
            fs.unlink(file.path, err => {
                if (err) console.error(`Error deleting file ${file.path}:`, err);
            });
        });

        // Create and save the new product
        const newProduct = new Product({
            name,
            description,
            price,
            categoryId,
            images: imageUrls,
        });

        await newProduct.save();
        res.status(201).json({ message: 'Product created successfully', product: newProduct });
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ message: 'Failed to create product', error: err.message });
    }
});
// Get all products
productRouter.get('/products', async (req, res) => {
    try {
        const products = await Product.find().populate('categoryId');
        // console.log(products)
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching products', error: err });
    }
});

// Get a single product by ID
productRouter.get('/products/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const product = await Product.findById(id).populate('categoryId');
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching product', error: err });
    }
});

// Update a product by ID with images
productRouter.put('/products/:id', upload, async (req, res) => {
    const { id } = req.params;
    const { name, description, price, categoryId } = req.body;

    const imageFiles = req.files ? req.files : [];

    try {
        // Upload new images to Cloudinary
        const imagePromises = imageFiles.map(file => {
            return new Promise((resolve, reject) => {
                cloudinary.uploader.upload(file.path, { resource_type: 'image' }, (err, result) => {
                    if (err) reject(err);
                    resolve(result.secure_url);
                });
            });
        });

        const imageUrls = await Promise.all(imagePromises);

        // Delete the files from the local `uploads` folder after uploading to Cloudinary
        imageFiles.forEach(file => {
            fs.unlink(file.path, err => {
                if (err) console.log(`Error deleting file ${file.path}: `, err);
            });
        });

        // Update the product with the new images
        const updatedProduct = await Product.findByIdAndUpdate(id, {
            name,
            description,
            price,
            categoryId,
            images: imageUrls.length > 0 ? imageUrls : undefined // Only update images if new ones are uploaded
        }, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
    } catch (err) {
        res.status(400).json({ message: 'Error updating product', error: err });
    }
});

// Delete a product by ID
productRouter.delete('/products/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const deletedProduct = await Product.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting product', error: err });
    }
});
const TIFFIN_CATEGORY_ID = '67309522db9584afc29cf395';

productRouter.get('/product', async (req, res) => {
    try {
        const tiffinCategoryId = new mongoose.Types.ObjectId(TIFFIN_CATEGORY_ID);

        const tiffinProducts = await Product.find({ categoryId: tiffinCategoryId }).populate('categoryId');
        console.log(tiffinProducts);
        res.status(200).json(tiffinProducts);

    } catch (err) {
        console.error('Error fetching tiffin service products:', err);  // Log full error in server console
        res.status(500).json({ message: 'Error fetching tiffin service products', error: err.message || err });
    }
});


module.exports = { productRouter };

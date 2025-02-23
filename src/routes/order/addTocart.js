const express = require('express');
const mongoose = require('mongoose');
const { Cart } = require('../../models/addTocart'); // Cart model
const { Product } = require("../../models/Product"); // Product model
const { userModel } = require('../../models/userModel'); // User model

const cartRouter = express.Router();

// Add item to cart
cartRouter.post('/cart/add', async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;
        console.log(req.body);

        if (!userId || !productId || !quantity) {
            return res.status(400).json({ message: 'userId, productId, and quantity are required.' });
        }

        if (quantity < 1) {
            return res.status(400).json({ message: 'Quantity must be at least 1.' });
        }

        // Validate productId format
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid productId format.' });
        }

        // Fetch the product from the database
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        // Find or create the cart
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = new Cart({ userId, items: [], totalPrice: 0 });
        }

        // Check if the product already exists in the cart
        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        if (itemIndex > -1) {
            // If product exists, update quantity
            cart.items[itemIndex].quantity += quantity;
        } else {
            // If product does not exist, add it to the cart
            cart.items.push({ productId, quantity });
        }

        // Recalculate the total price of the cart
        let totalPrice = 0;
        for (const item of cart.items) {
            const product = await Product.findById(item.productId);
            totalPrice += item.quantity * product.price;  // Assuming product has a 'price' field
        }

        // Update the total price in the cart
        cart.totalPrice = totalPrice;

        // Save the updated cart
        await cart.save();

        res.status(200).json({ message: 'Item added to cart successfully.', cart });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// Update cart item
cartRouter.put('/cart/update', async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;

        if (!userId || !productId || !quantity) {
            return res.status(400).json({ message: 'userId, productId, and quantity are required.' });
        }

        if (quantity < 1) {
            return res.status(400).json({ message: 'Quantity must be at least 1.' });
        }

        // Validate productId format
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid productId format.' });
        }

        // Fetch the product from the database
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ message: 'Product not found.' });
        }

        // Find the cart for the user
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found for this user.' });
        }

        // Find the product in the cart
        const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

        if (itemIndex > -1) {
            // If product exists, update the quantity
            cart.items[itemIndex].quantity = quantity;
        } else {
            // If product does not exist, add it to the cart
            cart.items.push({ productId, quantity });
        }

        // Recalculate the total price of the cart
        let totalPrice = 0;
        for (const item of cart.items) {
            const product = await Product.findById(item.productId);
            totalPrice += item.quantity * product.price;  // Assuming product has a 'price' field
        }

        // Update the total price in the cart
        cart.totalPrice = totalPrice;

        // Save the updated cart
        await cart.save();

        res.status(200).json({ message: 'Cart updated successfully.', cart });
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// Multiple product update
cartRouter.put('/cart/update-multiple', async (req, res) => {
    try {
        const { userId, products } = req.body;

        if (!userId || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ message: 'userId and products array are required.' });
        }

        let cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found for this user.' });
        }

        // Iterate over each product in the products array
        for (let productData of products) {
            const { productId, quantity } = productData;

            if (!productId || !quantity) {
                return res.status(400).json({ message: 'Each product must have productId and quantity.' });
            }

            if (quantity < 1) {
                return res.status(400).json({ message: 'Quantity must be at least 1.' });
            }

            // Validate productId format
            if (!mongoose.Types.ObjectId.isValid(productId)) {
                return res.status(400).json({ message: 'Invalid productId format.' });
            }

            // Fetch the product from the database
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).json({ message: `Product with ID ${productId} not found.` });
            }

            // Find the product in the cart
            const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);

            if (itemIndex > -1) {
                // If product exists, update the quantity
                cart.items[itemIndex].quantity = quantity;
            } else {
                // If product does not exist, add it to the cart
                cart.items.push({ productId, quantity });
            }
        }

        // Recalculate the total price of the cart
        let totalPrice = 0;
        for (const item of cart.items) {
            const product = await Product.findById(item.productId);
            totalPrice += item.quantity * product.price;  // Assuming product has a 'price' field
        }

        // Update the total price in the cart
        cart.totalPrice = totalPrice;

        // Save the updated cart
        await cart.save();

        res.status(200).json({ message: 'Cart updated successfully.', cart });
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// Fetch cart
cartRouter.get('/cart', async (req, res) => {
    try {
        const { userId } = req.query;  // Getting userId from query params

        if (!userId) {
            return res.status(400).json({ message: 'userId is required.' });
        }

        // Validate ObjectId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid userId format.' });
        }

        // Use new keyword to instantiate ObjectId
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // Fetch the cart for the user and populate product details
        const cart = await Cart.findOne({ userId: userObjectId }).populate('items.productId', 'name price images');

        if (!cart) {
            return res.status(404).json({ message: 'Cart not found for this user.' });
        }

        res.status(200).json({
            message: 'Cart fetched successfully.',
            cart
        });
    } catch (error) {
        console.error('Error fetching cart:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

// Remove item from cart
cartRouter.delete('/cart/remove', async (req, res) => {
    try {
        const { userId, productId } = req.body;

        if (!userId || !productId) {
            return res.status(400).json({ message: 'userId and productId are required.' });
        }

        // Validate productId format
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res.status(400).json({ message: 'Invalid productId format.' });
        }

        // Find the cart for the user
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found for this user.' });
        }

        // Remove the product from the cart
        cart.items = cart.items.filter(item => item.productId.toString() !== productId);

        // Recalculate the total price
        let totalPrice = 0;
        for (const item of cart.items) {
            const product = await Product.findById(item.productId);
            totalPrice += item.quantity * product.price; // Assuming 'price' field exists
        }
        cart.totalPrice = totalPrice;

        // Save the updated cart
        await cart.save();

        res.status(200).json({ message: 'Product removed successfully.', cart });
    } catch (error) {
        console.error('Error removing product from cart:', error);
        res.status(500).json({ message: 'Internal server error', error });
    }
});

module.exports = { cartRouter };

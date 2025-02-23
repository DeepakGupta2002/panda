const express = require("express");
const customerRoutes = express.Router();
// const { Customer } = require("../models/customer");
const customer = require("../models/customer");

// Add a new customer
customerRoutes.post("/add", async (req, res) => {
    try {
        const { name, email, contact, address, payment, mealCost } = req.body;

        const totalLunch = Math.floor(payment / mealCost.lunch);
        const totalDinner = Math.floor(payment / mealCost.dinner);

        const newCustomer = new customer({
            name,
            email,
            contact,
            address,
            payment,
            mealCost,
            remainingMeals: { lunch: totalLunch, dinner: totalDinner },
        });

        await newCustomer.save();
        res.status(201).json({ message: "Customer added successfully!", customer: newCustomer });
    } catch (error) {
        res.status(500).json({ message: "Failed to add customer", error: error.message });
    }
});

// Get customer details
customerRoutes.get("/:id", async (req, res) => {
    try {
        const customer = await Customer.findById(req.params.id).populate("deliveries");
        if (!customer) return res.status(404).json({ message: "Customer not found" });

        res.json(customer);
    } catch (error) {
        res.status(500).json({ message: "Failed to retrieve customer details", error: error.message });
    }
});

module.exports = { customerRoutes };

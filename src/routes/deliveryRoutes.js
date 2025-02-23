const express = require("express");
const deliveryRoutes = express.Router();
const Customer = require("../models/customer");

// Generate OTP
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

// Schedule a delivery
deliveryRoutes.post("/schedule/:customerId", async (req, res) => {
    try {
        const { mealType } = req.body; // lunch or dinner
        const customer = await Customer.findById(req.params.customerId);

        if (!customer) return res.status(404).json({ message: "Customer not found" });
        if (customer.remainingMeals[mealType] <= 0)
            return res.status(400).json({ message: `No remaining ${mealType} meals` });

        const otp = generateOTP();
        const today = new Date();

        const delivery = {
            date: today,
            mealType,
            otpDetails: {
                otp,
                expiresAt: new Date(today.getTime() + 10 * 60 * 1000), // OTP valid for 10 minutes
            },
        };

        customer.deliveries.push(delivery);
        customer.remainingMeals[mealType] -= 1; // Reduce remaining meals
        await customer.save();

        // Send OTP to email (Integrate nodemailer here)
        console.log(`OTP ${otp} sent to ${customer.email} for ${mealType} delivery.`);

        res.status(201).json({ message: "Delivery scheduled successfully!", delivery });
    } catch (error) {
        res.status(500).json({ message: "Failed to schedule delivery", error: error.message });
    }
});

// Confirm delivery using OTP
deliveryRoutes.post("/confirm/:customerId", async (req, res) => {
    try {
        const { otp, mealType } = req.body;
        const customer = await Customer.findById(req.params.customerId);

        if (!customer) return res.status(404).json({ message: "Customer not found" });

        const delivery = customer.deliveries.find(
            (d) => d.mealType === mealType && d.otpDetails.otp === otp && !d.delivered
        );

        if (!delivery) return res.status(400).json({ message: "Invalid OTP or delivery already confirmed" });

        // Confirm delivery
        delivery.delivered = true;
        await customer.save();

        res.json({ message: "Delivery confirmed successfully!" });
    } catch (error) {
        res.status(500).json({ message: "Failed to confirm delivery", error: error.message });
    }
});

module.exports = { deliveryRoutes };

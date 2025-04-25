const express = require('express');
const dotenv = require('dotenv');
const path = require('path'); // Required to resolve file paths
const fs = require('fs'); // Required for file system operations
const rateLimit = require('express-rate-limit');
const cluster = require('cluster'); // Cluster module for load balancing
const os = require('os'); // OS module to get the number of CPU cores
const { authRouter } = require('./src/routes/authRoutes');
const { protect } = require('./src/middleware/authMiddleware');
const { router } = require('./src/routes/mainCotegory');
const { mongoose } = require('./config/db');
const { cotegoryRouter } = require('./src/routes/cotegory/cotegorywaise');
const { productRouter } = require('./src/routes/cotegory/product');
const { cartRouter } = require('./src/routes/order/addTocart');
const { addreshRoute } = require('./src/routes/order/addreshRoute');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');

// const { handleLocationUpdate, handleUserDisconnect, locationController } = require("./src/controllers/locationController");
const { UserAddresRouter, addreshRouter } = require('./src/routes/User/AddreshRoutes');
const crypto = require('crypto');
const { Cart } = require('./src/models/addTocart');
// const Payment = require('./src/models/Payment');
const { deliveryBoyRouter } = require('./src/routes/deliveryBoy/authDeliveryBoy');
const { personalrouter } = require('./src/routes/deliveryBoy/personalRoutes');
const { Identificationrouter } = require('./src/routes/deliveryBoy/idRoutes');
const { BankRouter } = require('./src/routes/deliveryBoy/bankRoutes');
// Load environment variables
const Razorpay = require('razorpay'); // Ensure Razorpay is required
const { LocationRouter } = require('./src/routes/deliveryBoy/locationRoutes');
const Payment = require('./src/models/User/paymentSchema');  // ya '../models/Payment' path ke hisab se
const { sendInvoiceEmail } = require('./src/controllers/invoiceController');
// const { sendInvoiceEmail } = require('./controllers/invoiceController');
const User = require('./src/models/userModel');
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// const Razorpay = require('razorpay');

// const { deliveryBoyDocument } = require('./src/routes/deliveryBoy/deliveryBoyRoutes');


// console.log(process.env.KEY_ID)  

const razorpay = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET,
});

// 1. Create Razorpay Order
app.post('/order', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const cartRes = await fetch(`http://localhost:3000/api/cart?userId=${userId}`);
        const cartData = await cartRes.json();
        const amount = cartData.cart.totalPrice;

        const options = {
            amount: Math.round(amount * 100),
            currency: 'INR',
            receipt: `receipt_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        await Payment.create({
            userId,
            amount,
            orderId: order.id,
            status: 'Pending'
        });

        res.json({
            id: order.id,
            amount: order.amount,
            currency: order.currency,
            key: process.env.KEY_ID, // send key to frontend
        });
    } catch (error) {
        console.error('Error creating order:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// 2. Verify Payment
app.post('/verify-payment', async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    try {
        console.log('👉 Verifying Payment with:', {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        });

        const hash = crypto
            .createHmac('sha256', process.env.KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        if (hash === razorpay_signature) {
            console.log('✅ Signature Verified');

            // Update the payment status in the database
            const updatedPayment = await Payment.findOneAndUpdate(
                { orderId: razorpay_order_id },
                { status: 'Paid', paymentId: razorpay_payment_id },
                { new: true }
            );

            if (!updatedPayment) {
                console.log('❌ Payment record not found');
                return res.status(404).json({ success: false, message: 'Payment record not found' });
            }

            console.log('🧾 Updated Payment Record:', updatedPayment);

            // Find the user associated with the payment
            const user = await User.findById(updatedPayment.userId);
            if (!user) {
                console.log('❌ User not found');
                return res.status(404).json({ success: false, message: 'User not found' });
            }

            console.log('📧 Sending invoice to:', user.email);

            // Send the invoice email to the user after the payment is verified
            await sendInvoiceEmail(razorpay_order_id, user.email);

            console.log('✅ Invoice email sent successfully');

            // Respond back to the client with a success message
            return res.status(200).json({ success: true, message: 'Payment verified and invoice sent' });
        } else {
            console.log('❌ Signature Mismatch');
            return res.status(400).json({ success: false, message: 'Signature mismatch' });
        }
    } catch (err) {
        console.error('❌ Error in payment verification:', err);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// If the app is in master mode, spawn workers based on the number of CPU cores
if (cluster.isMaster) {
    const numCPUs = os.cpus().length; // Get the number of CPU cores

    console.log(`Master cluster setting up ${numCPUs} workers...`);

    // Fork workers
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork(); // Create worker processes
    }

    // When a worker dies, log it and restart the worker
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        cluster.fork(); // Restart the worker
    });
} else {
    // Worker process code
    app.use(express.json()); // Middleware to parse JSON

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true }); // Create uploads directory
    }

    // Serve static files from the 'public' folder
    app.use(express.static(path.join(__dirname, 'public')));

    // Set up rate limiter
    app.set('trust proxy', true);
    const limiter = rateLimit({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per windowMs
        message: 'Too many requests from this IP, please try again after 15 minutes.',
        standardHeaders: true,
        legacyHeaders: false,
    });
    app.set('trust proxy', 1);
    // Apply the rate limiter to all requests
    app.use(limiter);

    // Define your API prefix
    let api = "/api";

    // Set up your routes
    app.use(api, authRouter);
    app.use(api, router);
    app.use(api, cotegoryRouter);
    app.use(api, productRouter);
    app.use(api, cartRouter);
    app.use(api, addreshRoute);
    app.use(api, deliveryBoyRouter);
    // app.use(api, deliveryBoyDocumentt);

    // deilviery boy all Rotes

    app.use(api, personalrouter)
    app.use(api, Identificationrouter);
    app.use(api, BankRouter);
    app.use(api, LocationRouter);

    // user addreshRoute api 
    app.use(api, addreshRouter);


    // user addresh Router  
    // app.use(api, UserAddresRouter);
    // Protected profile route
    app.get('/api/profile', protect, (req, res) => {
        try {
            res.json({ message: `Welcome, ${req.user.name}!`, user: req.user });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    });


    // Serve index.html for all other routes that aren't API routes
    app.get('/home', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
    app.get('/cart', (req, res) => {
        res.sendFile(path.join(__dirname, 'public', 'cart.html'));
    });

    // Start the server
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
        console.log(`Server running on port ${PORT} (Worker PID: ${process.pid})`);
    });
}


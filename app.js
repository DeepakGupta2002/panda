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

const { handleLocationUpdate, handleUserDisconnect, locationController } = require("./src/controllers/locationController");
const { UserAddresRouter } = require('./src/routes/User/AddreshRoutes');
// Load environment variables
const Razorpay = require('razorpay'); // Ensure Razorpay is required



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
const crypto = require('crypto');
const { Cart } = require('./src/models/addTocart');
const Payment = require('./src/models/Payment');
const { deliveryBoyRouter } = require('./src/routes/deliveryBoy/authDeliveryBoy');
// const { deliveryBoyDocument } = require('./src/routes/deliveryBoy/deliveryBoyRoutes');

const razorpay = new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET
});
// console.log(process.env.KEY_ID)  

app.post('/order', async (req, res) => {
    const { userId } = req.body;
    console.log(req.body)
    // Check if userId is provided
    if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        // Fetch the amount from your cart API
        const cartResponse = await fetch(`http://localhost:3000/api/cart?userId=${userId}`);
        if (!cartResponse.ok) {
            throw new Error('Failed to fetch cart');
        }
        const cartData = await cartResponse.json();
        const amount = cartData.cart.totalPrice;

        // Create an order with Razorpay
        const options = {
            amount: amount * 100, // Amount in paise
            currency: 'INR',
            receipt: `receipt_order_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);

        // Save the userId and amount in the database
        const newPayment = new Payment({
            userId,
            amount
        });

        await newPayment.save();

        res.json(order);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Something went wrong' });
    }
});// Verify Payment Route

app.post('/api/payment/verify', async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    try {
        // Generate the expected signature
        const generated_signature = crypto
            .createHmac('sha256', 'YOUR_RAZORPAY_SECRET')
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest('hex');

        // Verify the signature
        if (generated_signature === razorpay_signature) {
            // Update the payment status in the database
            await Payment.findOneAndUpdate(
                { orderId: razorpay_order_id },
                { status: 'Paid', paymentId: razorpay_payment_id }
            );

            res.status(200).json({ success: true, message: 'Payment verified successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid signature' });
        }
    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ error: 'Internal Server Error' });
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



    // user addresh Router
    app.use(api, UserAddresRouter);
    // Protected profile route
    app.get('/api/profile', protect, (req, res) => {
        try {
            res.json({ message: `Welcome, ${req.user.name}!`, user: req.user });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error' });
        }
    });
    const users = {};

    // WebSocket logic (socket.io)
    io.on('connection', (socket) => {
        console.log('A user connected:', socket.id);

        // Handle location update from the client
        socket.on('send-location', (data) => {
            const { id, latitude, longitude } = data;
            // Store the user's location data
            users[id] = { latitude, longitude };

            // Broadcast the location to all clients (except the sender)
            socket.broadcast.emit('update-location', { id, latitude, longitude });
        });

        // Handle user disconnecting
        socket.on('disconnect', () => {
            console.log('A user disconnected:', socket.id);

            // Remove the user's marker when they disconnect
            delete users[socket.id];
            socket.broadcast.emit('remove-marker', socket.id);
        });
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


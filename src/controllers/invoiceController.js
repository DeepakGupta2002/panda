const nodemailer = require('nodemailer');
const Payment = require('../models/User/paymentSchema'); // Payment model
const User = require('../models/userModel'); // User model
const UserAddress = require('../models/User/Address');

// Function to send invoice email
const sendInvoiceEmail = async (orderId, userEmail) => {
    try {
        // Fetch payment record using orderId
        const payment = await Payment.findOne({ orderId });
        if (!payment) {
            throw new Error('Payment not found');
        }

        // Fetch user details associated with the payment
        const user = await User.findById(payment.userId);
        if (!user) {
            throw new Error('User not found');
        }

        // Fetch user address
        const userAddress = await UserAddress.findOne({ userId: user._id });
        console.log(userAddress);
        if (!userAddress) {
            throw new Error('No default address found for the user');
        }

        // HTML Email template
        const htmlBody = `
            <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
                <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
                    <div style="background-color: #ff5722; color: white; padding: 20px; text-align: center;">
                        <h2 style="margin: 0;">Bhookha Panda</h2>
                        <p style="margin: 5px 0 0;">Thanks for your delicious order!</p>
                    </div>
                    <div style="padding: 20px;">
                        <p>Hi <strong>${user.name}</strong>,</p>
                        <p>We're excited to serve you. Here's your order summary:</p>

                        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                            <tr>
                                <td style="padding: 8px; font-weight: bold;">Order ID:</td>
                                <td style="padding: 8px;">${orderId}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; font-weight: bold;">Amount Paid:</td>
                                <td style="padding: 8px;">₹${payment.amount}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; font-weight: bold;">Payment Status:</td>
                                <td style="padding: 8px;">${payment.status}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; font-weight: bold;">Transaction ID:</td>
                                <td style="padding: 8px;">${payment.paymentId}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px; font-weight: bold;">Payment Method:</td>
                                <td style="padding: 8px;">Razorpay</td>
                            </tr>
                        </table>

                        <p style="margin-top: 20px;">Your delivery address:</p>
                        <p><strong>Address:</strong> ${userAddress.address}</p>
                        <p><strong>Phone:</strong> ${userAddress.phone}</p>
                        <p><strong>Email:</strong> ${userEmail}</p>
                        <p style="margin-top: 20px;">If you have any questions or need support, reply to this email. We're here to help!</p>
                        <p style="font-size: 14px; color: #888;">This is a system-generated invoice. No GST number available currently.</p>
                    </div>
                    <div style="background-color: #eee; padding: 15px; text-align: center;">
                        <p style="margin: 0;">Bhookha Panda, Rewa, MP | support@bhookhapanda.com</p>
                    </div>
                </div>
            </div>
        `;

        // Nodemailer config
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_PORT == 465, // Secure for port 465
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"Bhookha Panda" <${process.env.EMAIL}>`,
            to: userEmail,
            subject: `🍱 Bhookha Panda - Order Confirmation #${orderId}`,
            html: htmlBody
        };

        // Send email
        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('❌ Error sending email:', err);
            } else {
                console.log('✅ Email sent: ' + info.response);
            }
        });

    } catch (error) {
        console.error('❌ Error in sendInvoiceEmail:', error);
    }
};

module.exports = { sendInvoiceEmail };

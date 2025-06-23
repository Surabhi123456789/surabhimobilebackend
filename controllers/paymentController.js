const Razorpay = require("razorpay");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const crypto = require('crypto');
const razorpay = new Razorpay({
    key_id: process.env.RZR_key_id,
    key_secret: process.env.RZR_key_secret,
});

exports.processPayment = catchAsyncErrors(async(req, res, next) => {
    const options = {
        amount: req.body.amount,
        currency: "INR",
        receipt: `order_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    res.status(200).json({
        success: true,
        order,
        razorpayApiKey: process.env.RZR_key_id
    });
});



exports.verifyRazorpayPayment = catchAsyncErrors(async (req, res, next) => {
    const { 
        razorpay_payment_id, 
        razorpay_order_id, 
        razorpay_signature 
    } = req.body;

    const razorpay = new Razorpay({
        key_id: process.env.RZR_key_id,
        key_secret: process.env.RZR_key_secret,
    });

    try {
        // Verify signature
        const generated_signature = crypto
            .createHmac('sha256', process.env.RZR_key_secret)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        // Check signature
        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Invalid signature'
            });
        }

        // Optional: Fetch payment details for additional verification
        const payment = await razorpay.payments.fetch(razorpay_payment_id);

        res.status(200).json({
            success: true,
            message: 'Payment verified successfully',
            payment
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Payment verification failed',
            error: error.message
        });
    }
});



exports.sendRazorApiKey = catchAsyncErrors(async(req, res, next) => {
    res.status(200).json({
        success: true,
        rzrApiKey: process.env.RZR_key_id,
    });
});
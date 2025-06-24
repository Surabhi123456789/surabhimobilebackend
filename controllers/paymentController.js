const Razorpay = require("razorpay");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const crypto = require('crypto');

// Initialize Razorpay with proper error handling
let razorpay;
try {
    if (!process.env.RZR_key_id || !process.env.RZR_key_secret) {
        throw new Error('Razorpay credentials not found in environment variables');
    }
    
    razorpay = new Razorpay({
        key_id: process.env.RZR_key_id,
        key_secret: process.env.RZR_key_secret,
    });
    
    console.log('✅ Razorpay initialized successfully');
} catch (error) {
    console.error('❌ Razorpay initialization failed:', error.message);
}

exports.processPayment = catchAsyncErrors(async(req, res, next) => {
    // Check if Razorpay is properly initialized
    if (!razorpay) {
        return res.status(500).json({
            success: false,
            message: "Payment service not configured properly"
        });
    }

    // Validate request body
    if (!req.body.amount || req.body.amount <= 0) {
        return res.status(400).json({
            success: false,
            message: "Invalid amount"
        });
    }

    try {
        const options = {
            amount: Math.round(req.body.amount), // Ensure integer
            currency: "INR",
            receipt: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            payment_capture: 1, // Auto capture payment
        };

        console.log('🔄 Creating Razorpay order with options:', options);
        
        const order = await razorpay.orders.create(options);
        
        console.log('✅ Razorpay order created:', order.id);

        res.status(200).json({
            success: true,
            order,
            razorpayApiKey: process.env.RZR_key_id
        });
    } catch (error) {
        console.error('❌ Error creating Razorpay order:', error);
        res.status(500).json({
            success: false,
            message: error.message || "Failed to create payment order"
        });
    }
});

exports.verifyRazorpayPayment = catchAsyncErrors(async (req, res, next) => {
    const { 
        razorpay_payment_id, 
        razorpay_order_id, 
        razorpay_signature 
    } = req.body;

    // Validate required fields
    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return res.status(400).json({
            success: false,
            message: 'Missing required payment verification parameters'
        });
    }

    // Check if Razorpay is properly initialized
    if (!razorpay) {
        return res.status(500).json({
            success: false,
            message: "Payment service not configured properly"
        });
    }

    try {
        console.log('🔍 Verifying payment:', {
            payment_id: razorpay_payment_id,
            order_id: razorpay_order_id
        });

        // Generate signature for verification
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const generated_signature = crypto
            .createHmac('sha256', process.env.RZR_key_secret)
            .update(body)
            .digest('hex');

        console.log('🔐 Signature verification:', {
            received: razorpay_signature,
            generated: generated_signature,
            match: generated_signature === razorpay_signature
        });

        // Check signature
        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({
                success: false,
                message: 'Payment signature verification failed'
            });
        }

        // Fetch payment details for additional verification
        const payment = await razorpay.payments.fetch(razorpay_payment_id);
        
        console.log('💳 Payment details:', {
            id: payment.id,
            status: payment.status,
            amount: payment.amount,
            currency: payment.currency
        });

        // Check if payment is captured/successful
        if (payment.status !== 'captured') {
            return res.status(400).json({
                success: false,
                message: `Payment not completed. Status: ${payment.status}`
            });
        }

        res.status(200).json({
            success: true,
            message: 'Payment verified successfully',
            payment: {
                id: payment.id,
                amount: payment.amount,
                currency: payment.currency,
                status: payment.status,
                method: payment.method,
                created_at: payment.created_at
            }
        });

    } catch (error) {
        console.error('❌ Payment verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Payment verification failed',
            error: error.message
        });
    }
});

exports.sendRazorApiKey = catchAsyncErrors(async(req, res, next) => {
    // Check if API key exists
    if (!process.env.RZR_key_id) {
        return res.status(500).json({
            success: false,
            message: "Razorpay API key not configured"
        });
    }

    res.status(200).json({
        success: true,
        rzrApiKey: process.env.RZR_key_id,
    });
});

// Health check for payment service
exports.paymentHealthCheck = catchAsyncErrors(async(req, res, next) => {
    const isConfigured = !!(process.env.RZR_key_id && process.env.RZR_key_secret && razorpay);
    
    res.status(200).json({
        success: true,
        configured: isConfigured,
        message: isConfigured ? 'Payment service is ready' : 'Payment service not configured'
    });
});
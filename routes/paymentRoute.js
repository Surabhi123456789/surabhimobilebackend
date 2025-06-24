// routes/paymentRoute.js
const express = require("express");
const {
    processPayment,
    sendRazorApiKey,
    verifyRazorpayPayment,
    paymentHealthCheck
} = require("../controllers/paymentController");

const { isAuthenticatedUser } = require("../middleware/auth");

const router = express.Router();

// Health check route (no auth required for debugging)
router.route("/health").get(paymentHealthCheck);

// Get Razorpay API key (protected route)
router.route("/razorpayapikey").get(isAuthenticatedUser, sendRazorApiKey);

// Process payment (create order)
router.route("/payment/process").post(isAuthenticatedUser, processPayment);

// Verify Razorpay payment
router.route("/razorpay/verify").post(isAuthenticatedUser, verifyRazorpayPayment);

module.exports = router;
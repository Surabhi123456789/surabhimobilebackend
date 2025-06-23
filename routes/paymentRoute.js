const express = require("express");

const router = express.Router();

const {isAuthenticatedUser} = require("../middleware/auth");
const { processPayment, sendRazorApiKey , verifyRazorpayPayment } = require("../controllers/paymentController");


router.route("/payment/process").post(isAuthenticatedUser,processPayment);
router.route("/rzrApiKey").get(isAuthenticatedUser,sendRazorApiKey)
router.route("/razorpay/verify").post(isAuthenticatedUser, verifyRazorpayPayment);
module.exports = router;
const catchAsyncErrors = require("./catchAsyncErrors");
const ErrorHandler = require("../utils/errorhandler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    console.log('🔐 Authentication Check Started');
    console.log('📋 All cookies:', req.cookies);
    console.log('📋 Raw cookie header:', req.headers.cookie);
    console.log('📋 Origin:', req.headers.origin);
    console.log('📋 User-Agent:', req.headers['user-agent']);
    
    const { token } = req.cookies;
    
    if (!token) {
        console.log('❌ No token found in cookies');
        console.log('Available cookie keys:', Object.keys(req.cookies));
        return next(new ErrorHandler("Please Login to access this resource", 401));
    }
    
    console.log('✅ Token found, length:', token.length);
    
    try {
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Token decoded successfully, user ID:', decodedData.id);
        
        req.user = await User.findById(decodedData.id);
        
        if (!req.user) {
            console.log('❌ User not found with decoded ID');
            return next(new ErrorHandler("User not found", 401));
        }
        
        console.log('✅ User authenticated:', req.user.email);
        console.log('🔐 Authentication Check Completed Successfully');
        next();
        
    } catch (error) {
        console.log('❌ Token verification failed:', error.message);
        return next(new ErrorHandler("Invalid token", 401));
    }
});

exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return next(
                new ErrorHandler(
                    `Role: ${req.user.role} is not allowed to access this resource`,
                    403
                )
            );
        }
        next();
    };
};
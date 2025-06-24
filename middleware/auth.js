// const catchAsyncErrors = require("./catchAsyncErrors");
// const ErrorHander  = require("../utils/errorhandler")
// const jwt = require("jsonwebtoken")
// const User = require("../models/userModel");


// exports.isAuthenticatedUser = catchAsyncErrors(async(req,res, next )=>{
//     const {token} = req.cookies;
//     if (!token) {
//         return next(new ErrorHander("Please Login to access this resource", 401));
//       }
    
//       const decodedData = jwt.verify(token, process.env.JWT_SECRET);
    
//       req.user = await User.findById(decodedData.id);
    
//       next();
    

// })
// exports.authorizeRoles = (...roles)=>{

//     return (req,res,next)=>{

//         if(!roles.includes(req.user.role))
//         {
//           return next( new ErrorHander(`Role: ${req.user.role} is not allowed to access this resource`,403))
//         }

//         next();
//     }
// }
// middleware/auth.js - Enhanced with debugging
const catchAsyncErrors = require("./catchAsyncErrors");
const ErrorHandler = require("../utils/errorhandler");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
    console.log('=== Authentication Debug ===');
    console.log('All cookies:', req.cookies);
    console.log('Headers:', req.headers.cookie);
    
    const { token } = req.cookies;
    
    if (!token) {
        console.log('No token found in cookies');
        return next(new ErrorHandler("Please Login to access this resource", 401));
    }
    
    console.log('Token found:', token ? 'Yes' : 'No');
    
    try {
        const decodedData = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decoded successfully, user ID:', decodedData.id);
        
        req.user = await User.findById(decodedData.id);
        
        if (!req.user) {
            console.log('User not found with decoded ID');
            return next(new ErrorHandler("User not found", 401));
        }
        
        console.log('User authenticated:', req.user.email);
        console.log('=== End Auth Debug ===');
        next();
        
    } catch (error) {
        console.log('Token verification failed:', error.message);
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
const ErrorHandler = require("../utils/errorhandler")
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const User = require("../models/userModel")
const sendToken = require("../utils/jwtToken")
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto")
const cloudinary = require("cloudinary");

// register a user
exports.registerUser = catchAsyncErrors(async (req, res, next) => {

    if(!req.body.name || !req.body.email || !req.body.password) {
        return next(new ErrorHandler("Please provide all required fields", 400));
    }

    if(!req.body.avatar) {
        return next(new ErrorHandler("Please provide an avatar", 400));
    }

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
      folder: "avatars",
      width: 150,
      crop: "scale",
    });
  
    const { name, email, password } = req.body;
  
    const user = await User.create({
      name,
      email,
      password,
      avatar: {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      },
    });
  
    sendToken(user, 201, res);
  });

// login user

exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    console.log('🔐 Login attempt:', {
        email: req.body.email,
        hasPassword: !!req.body.password,
        origin: req.headers.origin,
        userAgent: req.headers['user-agent']
    });

    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
        return next(new ErrorHandler("Please enter email and password", 400));
    }

    // Find user with password (since it's select: false in model)
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
        console.log('❌ User not found:', email);
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    // Check password
    const isPasswordMatched = await user.comparePassword(password);

    if (!isPasswordMatched) {
        console.log('❌ Password mismatch for:', email);
        return next(new ErrorHandler("Invalid email or password", 401));
    }

    console.log('✅ Login successful for:', email);
    
    // Send token (this will set the cookie)
    sendToken(user, 200, res);
});

// Enhanced logout function
exports.logout = catchAsyncErrors(async (req, res, next) => {
    console.log('🚪 Logout request received');
    
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
        path: '/',
    });

    console.log('✅ Logout successful - cookie cleared');

    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    });
});
// forgot password

exports.forgotPassword = catchAsyncErrors(async(req,res,next)=>{

    const user = await User.findOne({email:req.body.email});

    if(!user){
        return next(new ErrorHandler("user not found ",404));
    }

    // get resetpassword token

    const resetToken = user.getResetPasswordToken();

    await user.save({validateBeforeSave: false});

    const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

    const message = `your password reset token is :- \n\n ${resetPasswordUrl} \n\n if you have not requested this email then, please ignore it`;

    try{
         
        await sendEmail({
              email:user.email,
              subject: `Ecommerce password recovery`,
              message,
        });

        res.status(200).json({
            success:true,
            message: `email sent to ${user.email} successfully`
        })
    }catch(error){
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({validateBeforeSave: false});

        return next(new ErrorHandler(error.message,500));
    }

})

// reset password

exports.resetPassword = catchAsyncErrors(async(req,res,next)=>{

    // creating token hash
     const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

      const user = await User.findOne({
         resetPasswordToken,
         resetPasswordExpire:{$gt:Date.now()},
      });

     
       if(!user)
        {
            return next(new ErrorHandler("reset password token has been expired or invalid",400))
        }
    
        user.password = req.body.password ;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();

        sendToken(user,200,res);
})
       
        
// get user details 

exports.getUserDetails = catchAsyncErrors(async(req,res,next)=>{

    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        user
    });
})

// update user password

exports.updatePassword = catchAsyncErrors(async(req,res,next)=>{

    const user = await User.findById(req.user.id).select("+password");

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched)
    {
        return next(new ErrorHandler("old password is incorrect",400));
    }

    if(req.body.newPassword !== req.body.confirmPassword)
    {
        return next(new ErrorHandler("password does not matched ",400));
    }

    user.password = req.body.newPassword;
    await user.save();

    sendToken(user,200,res);
})

// user update profile 
exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
      name: req.body.name,
      email: req.body.email,
    };
  
    if (req.body.avatar !== "") {
      const user = await User.findById(req.user.id);
  
      const imageId = user.avatar.public_id;
  
      await cloudinary.v2.uploader.destroy(imageId);
  
      const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale",
      });
  
      newUserData.avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }
  
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });
  
    res.status(200).json({
      success: true,
    });
  });

// get all user for admin only
exports.getAllUser = catchAsyncErrors(async(req,res,next)=>{
    
    const users = await User.find();


    res.status(200).json({
        success: true,
        users,
    })
})

// get single user (admin )
exports.getSingleUser = catchAsyncErrors(async(req,res,next)=>{
     
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(
        new ErrorHandler(`User does not exist with Id: ${req.params.id}`)
      );
    }
  
    res.status(200).json({
      success: true,
      user,
    });
})

// update user role --admin

exports.updateUserRole = catchAsyncErrors(async(req,res,next)=>{

    const newUserData = {
        name : req.body.name,
        email: req.body.email,
        role: req.body.role,
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData,{
        new: true,
        runValidators: true,
        useFindAndModify: false,
    } );

    res.status(200).json({
        success: true,

    });
})


// delete user --admin
exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id);
  
    if (!user) {
      return next(
        new ErrorHandler(`User does not exist with Id: ${req.params.id}`, 400)
      );
    }
  
    const imageId = user.avatar.public_id;
  
    await cloudinary.v2.uploader.destroy(imageId);
  
    await user.deleteOne({ _id: req.params.id });
  
    res.status(200).json({
      success: true,
      message: "User Deleted Successfully",
    });
  });


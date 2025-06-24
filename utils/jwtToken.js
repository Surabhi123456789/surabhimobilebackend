
// // creating token and saving in cookie

// const sendToken = (user , statusCode,res)=>{

//     const token = user.getJWTToken();

//     // option for cookie

//     const options = {
//         expires: new Date(
//             Date.now() + process.env.COOKIE_EXPIRE *24*60*60*1000
//         ),
//         httpOnly : true,

//     };

//     res.status(statusCode).cookie("token",token,options).json({
//         success: true,
//         user,
//         token
//     });
// };

// module.exports = sendToken;

// utils/jwtToken.js - Complete working version
const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken();

  // Options for cookie
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Important for cross-origin
    path: '/', // Ensure cookie is available for all paths
  };

  // Log for debugging (remove in production)
  console.log('Setting cookie with options:', options);
  console.log('Token being set:', token ? 'Token exists' : 'No token');

  res.status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      user,
      token, // Include token in response for debugging
    });
};

module.exports = sendToken;
const sendToken = (user, statusCode, res) => {
  const token = user.getJWTToken();

  // Calculate expiry
  const cookieExpire = parseInt(process.env.COOKIE_EXPIRE) || 7;

  const options = {
    expires: new Date(Date.now() + cookieExpire * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  };

  console.log('🍪 Setting JWT Cookie:', {
    tokenLength: token ? token.length : 0,
    options: options,
    environment: process.env.NODE_ENV,
  });

  // Remove password from user object before sending
  const userResponse = { ...user.toObject() };
  delete userResponse.password;

  res.status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      user: userResponse,
      message: statusCode === 201 ? 'Registration successful' : 'Login successful'
    });
};

module.exports = sendToken;
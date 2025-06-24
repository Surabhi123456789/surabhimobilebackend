// ===== FIXED app.js =====
const express = require("express");
const cors = require('cors');
const app = express();
const errorMiddleware = require("./middleware/error");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");

// Load environment variables FIRST
dotenv.config({path:"backend/config/config.env"});

// FIXED: Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'https://surabhimobilefrontend.vercel.app',
      'http://localhost:3000', // Add for local development
      'http://localhost:3001', // Alternative port
      process.env.FRONTEND_URL, // From environment variable
    ].filter(Boolean); // Remove undefined values
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log('🚫 CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true, // CRITICAL: Must be true for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  exposedHeaders: ['Set-Cookie'], // Expose Set-Cookie header
  optionsSuccessStatus: 200,
  preflightContinue: false,
};

// Apply CORS BEFORE other middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// CRITICAL: Cookie parser must come BEFORE routes
app.use(cookieParser());

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true }));

// File upload configuration
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/',
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  abortOnLimit: true,
}));

// Add debugging middleware for cookie issues
app.use((req, res, next) => {
  console.log('🌐 Incoming Request:', {
    method: req.method,
    url: req.url,
    origin: req.headers.origin,
    cookies: req.cookies,
    hasCookieParser: !!req.cookies,
  });
  
  // Log response headers for debugging
  const originalSend = res.send;
  res.send = function(data) {
    console.log('📤 Response Headers:', {
      'set-cookie': res.getHeaders()['set-cookie'],
      'access-control-allow-credentials': res.getHeaders()['access-control-allow-credentials'],
    });
    return originalSend.call(this, data);
  };
  
  next();
});

// Route imports
const product = require("./routes/productRoute");
const user = require("./routes/userRoute");
const order = require("./routes/orderRoute");
const payment = require("./routes/paymentRoute");

// Apply routes
app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use("/api/v1", payment);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Middleware for error handling (must be last)
app.use(errorMiddleware);

module.exports = app;
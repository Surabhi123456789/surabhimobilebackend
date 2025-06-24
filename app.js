const express = require("express")
const cors = require('cors');
const app = express();

const errorMiddleware = require("./middleware/error")
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");


const dotenv = require("dotenv");

dotenv.config({path:"backend/config/config.env"});

// const corsOptions = {
//   origin: "https://surabhimobilefrontend.vercel.app", // allow your frontend domain
//   methods: ["GET", "POST", "PUT", "DELETE"],  
//    allowedHeaders: ["Content-Type", "Authorization"],         // allow desired HTTP methods
//   credentials: true                                    // allow cookies if used
// };
// CORS configuration
const corsOptions = {
  origin: [
    'https://surabhimobilefrontend.vercel.app', // Local development
    'https://your-frontend-domain.com', // Your production frontend URL
    // Add your actual frontend domain here
  ],
  credentials: true, // This is CRUCIAL - allows cookies to be sent
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser()); 
app.use(bodyParser.urlencoded({extended: true}));
app.use(fileUpload(
   {useTempFiles: true,
   }
));
// route imports 

const product = require("./routes/productRoute");
const user = require("./routes/userRoute");
const order = require("./routes/orderRoute")
const payment = require("./routes/paymentRoute");





app.use("/api/v1",product);
app.use("/api/v1",user);
app.use("/api/v1",order);
app.use("/api/v1",payment);



// middleware for error
app.use(errorMiddleware);


module.exports = app


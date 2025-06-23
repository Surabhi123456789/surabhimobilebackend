const cors = require('cors');


const app = require("./app");
const dotenv = require("dotenv");
const cloudinary = require("cloudinary");
const connectDatabase = require("./config/database")

app.use(cors());

process.on("uncaughtException",(err)=>{
    console.log(`Error: ${err.message}`);
    console.log(`shutting down the server due to uncaught execption`)
})


dotenv.config({path:"backend/config/config.env"});

// connect db
connectDatabase()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const server = app.listen(process.env.PORT,()=>{

    console.log(`SERVER IS WORKING ON https://localhost:${process.env.PORT}`)
})

// unhandled promise rejection
process.on("unhandledRejection",(err)=>{
    console.log(`Error: ${err.message}`);
    console.log(`shutting down the server due to unhandles promise rejection`);
    server.close(()=>{
        process.exit(1);
    });
});
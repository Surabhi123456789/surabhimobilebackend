const mongoose = require("mongoose");

const connectDatabase = () =>{

    mongoose.connect(process.env.DB_URL,{
        useNewUrlParser: true,
        useUnifiedTopology: true,
        
    }).then((data) => 
      {
        console.log(`Mongodb connected with server: ${data.connection.host}`);
      })
      // unhandled promoise solve krne k baad yaha catch likhne ki 
      // jaroorat nahi hai 
}

module.exports = connectDatabase
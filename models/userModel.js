const mongoose = require("mongoose");

const validator = require("validator");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken")

const crypto = require("crypto")
// yhi pe user password ko bcrypt kr lenge

const userSchema = new mongoose.Schema({
    name:{
        type: String ,
        required: [true,"please enter your name "],
        maxLength:[30,"name cannot exceed 30 character"],
        minLength:[4,"name should have more than 4 character"]
    },
    email: {
        type: String,
        required: [true, "Please Enter Your Email"],
        unique: true,
        validate: [validator.isEmail, "Please Enter a valid Email"],
      },
      password: {
        type: String,
        required: [true, "Please Enter Your Password"],
        minLength: [8, "Password should be greater than 8 characters"],
        select: false,
      },
      avatar: {
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
      role: {
        type: String,
        default: "user",
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    
      resetPasswordToken: String,
      resetPasswordExpire: Date,
   
 });
  
//  hm yaha => funct isliye ni use kr rhe kyunki usme this keyword use ni hota h

userSchema.pre("save",async function(next){

    // yaha pe name and other chije update krne pe pasword update na ho isliye
    // if condition ayi hai kyunki aisa ni hua toh ye hashes password ko phir se 
    // hash kr dega , hm password update alag se banayenge

    if(!this.isModified("password")){
        next();
    }
    // is pasword change hua hai toh ye wali line apply ho jayegi
    this.password = await bcrypt.hash(this.password,10)
})

// jwt token

userSchema.methods.getJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE,
    });
  };


//   compare password 

userSchema.methods.comparePassword = async function(password){
    return await bcrypt.compare(password,this.password)
}

// generating pasword reset token
userSchema.methods.getResetPasswordToken = function(){
    
  // generating token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // hashing and addding to user schema 
  this.resetPasswordToken = crypto
  .createHash("sha256")
  .update(resetToken)
  .digest("hex");

  this.resetPasswordExpire = Date.now() + 15*60*1000;
  return resetToken;
}


module.exports = mongoose.model("User",userSchema);
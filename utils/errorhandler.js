class ErrorHandler extends Error{
    // node ki error class ko inherit kia hai 

    constructor(message,statusCode){
        
        super(message);
        this.statusCode = statusCode
            // error ka method use kr rhe
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = ErrorHandler;
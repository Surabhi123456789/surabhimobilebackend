module.exports = theFunc =>(req,res,next)=>{
    // use to handle try catch blacks 
    // promise is a class of a java script
    // promise is worked as try block 
    Promise.resolve(theFunc(req,res,next)).catch(next);
}
const mongoose=require("mongoose");

const connectDB=async ()=>{
    try{
        await mongoose.connect(process.env.MONGO_URI,{});
        console.log("mongodb connect");
    }catch(err){
       console.error("Error connect to MongoDB",err);  
       process.exit(1);
    }
};
module.exports=connectDB;
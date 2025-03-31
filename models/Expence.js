const mongoose = require('mongoose');

const ExpenceSchema=new mongoose.Schema({
    userId:{ type:mongoose.Schema.Types.ObjectId, ref:"User",required:true},
    icon:{ type:String},
    category:{ type:String,required:true}, // Example : food ,grocery ,Rent
    amount:{ type:Number,required:true},
    date:{ type:Date,default:Date.now},
},{timestamps:true});

module.exports=mongoose.model("Expence",ExpenceSchema);
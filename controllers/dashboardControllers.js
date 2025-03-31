    const Income= require("../models/Income");
    const Expence= require("../models/Expence");

    const {isValidObjectId, Types}=require("mongoose");


    // Dashborad data

exports.getDashboardData=async(req,res)=>{
  try{
    const userId=req.user.id;
    console.log("userId",userId);
    const userobjectId=new Types.ObjectId(String(userId));

    // fetch total income and expence 

    const totalIcome=await Income.aggregate([
        {$match:{ userId:userobjectId }},
        {$group:{_id:null,total:{$sum:"$amount"}}},
    ]);
    console.log("totalIncome",{totalIcome,userId:isValidObjectId(userId)});
    const totalExpence=await Expence.aggregate([
        {$match:{ userId:userobjectId }},
        {$group:{_id:null,total:{$sum:"$amount"},}},
    ]);

    // Get Income transaction in the last 60 days
    const last600daysIncomeTransaction=await Income.find({
        userId,
        date:{
            $gte:new Date(Date.now()-60*24*60*60*1000),
        },
    }).sort({date:-1});

    // Get total income transaction in the last 60 days
    const incomelast60days=last600daysIncomeTransaction.reduce((sum,transaction)=>sum+transaction.amount,0);

// Get expence transaction in the last 30 days

const last30daysExpenceTransaction=await Expence.find({
    userId,
    date:{
        $gte:new Date(Date.now()-30*24*60*60*1000),
    },
  }).sort({date:-1});

// Get total expence transaction in the last 30 days

const expencelast30days=last30daysExpenceTransaction.reduce((sum,transaction)=>sum+transaction.amount,0);

// Fetch last 5 transaction of income and expence
const lastTransaction  =[...(await Income.find({userId}).sort({date:-1}).limit(5)).map((txn)=>({
    ...txn.toObject(),
    type:"income", 
})
),
...(await Expence.find({userId}).sort({date:-1}).limit(5)).map((txn)=>({
    ...txn.toObject(),
    type:"expence",
})
),].sort((a,b)=>b.date-a.date); 

// final response

 res.json({totalBalance:(totalIncome[0]?.total || 0)-(totalExpence[0]?.total || 0),
    totalIncome:totalIncome[0]?.total || 0,
    totalExpence:totalExpence[0]?.total || 0,
    last30daysExpence:{
        total:expencelast30days,
        transaction:last30daysExpenceTransaction,
    },
    last60daysIncome:{
        total:incomelast60days,
        transaction:last600daysIncomeTransaction,
    },
    recentTransaction:lastTransaction,
});
}catch(error){
    res.status(500).json({message:"Server Error",error});
}
}
  
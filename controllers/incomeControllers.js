const xlsx=require('xlsx');
const Income=require('../models/Income')





//add Income source

exports.addIncome = async (req, res) => {
    const userId=req.user.id;

    try{
        const {icon,source,amount,date}=req.body; 

        // Validation check for missing fields
        if(!source || !amount || !date){
            return res.status(400).json({message:"All feilds are required"})
        }
          // Validate date
          const parsedDate = new Date(date);
          if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(parsedDate.getTime())) {
            return res.status(400).json({ message: "Invalid date format. Use YYYY-MM-DD." });
        }
  
        const newIncome=new Income({
            userId,
            icon,
            source,
            amount,
            date:parsedDate,
        });
        await newIncome.save();
        res.status(200).json(newIncome)
    }catch(error){
        console.error(error);
        res.status(500).json({message:"Server Error"})
    }
};

// GET all Income source

exports.getAllIncome = async (req, res) => {
    const userId=req.user.id;
    
    try{
        const income=await Income.find({userId}).sort({date:-1});
        res.json({income})
    }catch(error){
        console.error(error);
        res.status(500).json({message:"Server Error"})
    }
};
// delete Income source

exports.deleteIncome = async (req, res) => {

    try{
        await Income.findByIdAndDelete(req.params.id);
        res.json({message:"Income deleted Susseccfully"})
    }catch(error){
        console.error(error);
        res.status(500).json({message:"Server Error"})
    }
};
//download Excel file of Income source

exports.downloadIncomeExcel = async (req, res) => {
    const userId=req.user.id;
    try{
        const income=await Income.find({userId}).sort({date:-1});
        
        // prepare data for Excel

        const data=income.map((item)=>({
            Source:item.source,
            Amount:item.amount,
            Date:item.date,
        }));
        // create Excel
        const wb=xlsx.utils.book_new();
        const ws=xlsx.utils.json_to_sheet(data);
        xlsx.utils.book_append_sheet(wb,ws,"Income");
        xlsx.writeFile(wb,"income_details.xlsx");
        res.download("income_details.xlsx");
    }catch(error){
        console.error(error);
        res.status(500).json({message:"Server Error"})
    }
};

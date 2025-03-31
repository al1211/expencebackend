const xlsx = require("xlsx");
const Expence = require("../models/Expence");

//add Expence    source

exports.addExpence = async (req, res) => {
  const userId = req.user.id;

  try {
    const { icon, category, amount, date } = req.body;

    // Validation check for missing fields
    if (!category || !amount || !date) {
      return res.status(400).json({ message: "All feilds are required" });
    }
    // Validate date
    const parsedDate = new Date(date);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(parsedDate.getTime())) {
      return res
        .status(400)
        .json({ message: "Invalid date format. Use YYYY-MM-DD." });
    }

    const newExpence = new Expence({
      userId,
      icon,
      category,
      amount,
      date: parsedDate,
    });
    await newExpence.save();
    res.status(201).json({ newExpence });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// GET all Expence source

exports.getAllExpence = async (req, res) => {
  const userId = req.user.id;
  try {
    const expence = await Expence.find({ userId }).sort({ date: -1 });
    res.json({ expence });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
// delete expence source

exports.deleteExpence = async (req, res) => {
  try {
    await Expence.findByIdAndDelete(req.params.id);
    res.json({ message: "Expence deleted Susseccfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
//download Excel file of Income source

exports.downloadExpenceExcel = async (req, res) => {
  const userId = req.user.id;
  try {
    const expence= await Expence.find({ userId }).sort({ date: -1 });

    // prepare data for Excel

    const data = expence.map((item) => ({
      category: item.category,
      Amount: item.amount,
      Aate: item.date,
    }));
    // create Excel
    const wb = xlsx.utils.book_new();
    const ws = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(wb, ws,"expence");
    xlsx.writeFile(wb, "expence_details.xlsx");
    res.download("expence_details.xlsx");
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

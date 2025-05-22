// const Income = require("../models/Income");
// const Expence = require("../models/Expence");

// const { isValidObjectId, Types } = require("mongoose");

// // Dashborad data

// exports.getDashboardData = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     const userobjectId = new Types.ObjectId(String(userId));

//     // fetch total income and expence

//     const totalIcome = await Income.aggregate([ 
//       { $match: { userId: userobjectId } },
//       { $group: { _id: null, total: { $sum: "$amount" } } },
//     ]);

  

//     const totalExpence = await Expence.aggregate([
//       { $match: { userId: userobjectId } },
//       { $group: { _id: null, total: { $sum: "$amount" } } },
//     ]);

//     // Get Income transaction in the last 60 days
//     const last60daysIncomeTransaction = await Income.find({
//       userId,
//       date: { $gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
//     }).sort({ date: -1 });

//     // Get total income transaction in the last 60 days
//     const incomelast60days = last60daysIncomeTransaction.reduce(
//       (sum, transaction) => sum + transaction.amount,
//       0
//     );

//     // Get expence transaction in the last 30 days

  

// console.log("Expenses found in last 30 days:", last30daysExpenceTransaction.length);


//     const last30daysExpenceTransaction = await Expence.find({
//       userId,
//       date: {$gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
//       },
//     }).sort({ date: -1 });
 
//     // Get total expence transaction in the last 30 days

//     const expencelast30days = last30daysExpenceTransaction.reduce(
//       (sum, transaction) => sum + transaction.amount,
//       0
//     );


//     // Fetch last 5 transaction of income and expence
//     const lastTransaction = [
//       ...(await Income.find({ userId }).sort({ date: -1 }).limit(5)).map(
//         (txn) => ({
//           ...txn.toObject(),
//           type: "income",
//         })
//       ),
//       ...(await Expence.find({ userId }).sort({ date: -1 }).limit(5)).map(
//         (txn) => ({
//           ...txn.toObject(),
//           type: "expence",
//         })
//       ),
//     ].sort((a, b) => b.date - a.date);

//     // final response

//     res.json({
//       totalBalance: (totalIcome[0]?.total || 0) - (totalExpence[0]?.total || 0),
//       totalIncome: totalIcome[0]?.total || 0,
//       totalExpence: totalExpence[0]?.total || 0,
//       last30daysExpence: {
//         total: expencelast30days,
//         transaction: last30daysExpenceTransaction,
//       },
//       last60daysIncome: {
//         total: incomelast60days,
//         transaction: last60daysIncomeTransaction,
//       },
//       recentTransaction: lastTransaction,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Server Error in dashborad", error });
//   }
// };


const Income = require("../models/Income");
const Expence = require("../models/Expence");
const { Types } = require("mongoose");

exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Validate user ID format
    if (!Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const userObjectId = new Types.ObjectId(userId);

    // Get total income
    const totalIncomeAgg = await Income.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalIncome = totalIncomeAgg[0]?.total || 0;

    // Get total expense
    const totalExpenceAgg = await Expence.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalExpence = totalExpenceAgg[0]?.total || 0;

    // Get last 60 days income
    const incomeCutoffDate = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
    const last60DaysIncomeTransactions = await Income.find({
      userId: userObjectId,
      date: { $gte: incomeCutoffDate },
    }).sort({ date: -1 });

    const incomeLast60DaysTotal = last60DaysIncomeTransactions.reduce(
      (sum, txn) => sum + txn.amount,
      0
    );

    // Get last 30 days expense
    const expenceCutoffDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const last30DaysExpenceTransactions = await Expence.find({
      userId: userObjectId,
      // date: { $gte: expenceCutoffDate },
    }).sort({ date: -1 });

    const expenceLast30DaysTotal = last30DaysExpenceTransactions.reduce(
      (sum, txn) => sum + txn.amount,
      0
    );

    // Get recent 5 transactions (income + expense)
    const recentTransactions = [
      ...(await Income.find({ userId: userObjectId }).sort({ date: -1 }).limit(5)).map(txn => ({
        ...txn.toObject(),
        type: "income",
      })),
      ...(await Expence.find({ userId: userObjectId }).sort({ date: -1 }).limit(5)).map(txn => ({
        ...txn.toObject(),
        type: "expence",
      })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Final response
    res.json({
      totalBalance: totalIncome - totalExpence,
      totalIncome,
      totalExpence,
      last60daysIncome: {
        total: incomeLast60DaysTotal,
        transaction: last60DaysIncomeTransactions,
      },
      last30daysExpence: {
        total: expenceLast30DaysTotal,
        transaction: last30DaysExpenceTransactions,
      },
      recentTransaction: recentTransactions,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Server Error in dashboard", error });
  }
};

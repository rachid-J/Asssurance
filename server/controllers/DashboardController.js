// controllers/dashboardController.js
const mongoose = require('mongoose');
const Insurance = require('../models/Insurance');
const Payment = require('../models/Payment');
const Client = require('../models/Client');

// Helper function to determine if user is admin
const isAdmin = (user) => user?.role === 'admin';

const getDashboardStats = async (req, res) => {
  try {
    console.log('Getting dashboard stats for user:', req.user?._id);
    
    const userId = req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null;
    const { startDate, endDate } = req.query;
    const admin = isAdmin(req.user);

    // Date filters
    const insuranceDateFilter = {};
    const paymentDateFilter = {};

    if (startDate && endDate) {
      insuranceDateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
      paymentDateFilter.paymentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // User filters (only apply insurance filters if not admin)
    const insuranceUserFilter = !admin && userId ? { createdby: userId } : {};
    const insuranceMatchFilter = { ...insuranceUserFilter, ...insuranceDateFilter };

    const [totalClients, revenueResult, statusCounts] = await Promise.all([
      // Always count all clients
      Client.countDocuments({}),
      
      // Payment aggregation with insurance filter for non-admins
      Payment.aggregate([
        {
          $lookup: {
            from: 'insurances',
            localField: 'insurance',
            foreignField: '_id',
            as: 'insurance'
          }
        },
        { $unwind: { path: '$insurance', preserveNullAndEmptyArrays: false } },
        { 
          $match: { 
            ...(!admin && userId ? { 'insurance.createdby': userId } : {}),
            ...paymentDateFilter 
          } 
        },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      
      // Insurance status counts with filter
      Insurance.aggregate([
        { $match: insuranceMatchFilter },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ])
    ]);

    // Process status counts
    const statusStats = statusCounts.reduce((acc, curr) => {
      if (curr._id) {
        acc[curr._id.toLowerCase()] = curr.count;
      }
      return acc;
    }, { active: 0, expired: 0, termination: 0, canceled: 0 });

    // Calculate remaining payments
    const remainingPayments = await calculateRemainingPayments(userId, admin);

    res.status(200).json({
      success: true,
      data: {
        totalClients,
        monthlyRevenue: revenueResult[0]?.total || 0,
        ...statusStats,
        remainingPayments
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
};

// Remaining payments calculation
async function calculateRemainingPayments(userId, admin) {
  try {
    const baseFilter = {
      status: { $nin: ["Canceled", "Termination"] } // Always exclude these statuses
    };

    const filter = admin
      ? baseFilter
      : { ...baseFilter, createdby: userId };

    const insurances = await Insurance.find(filter);

    let totalRemaining = 0;
    for (const insurance of insurances) {
      const payments = await Payment.find({ insurance: insurance._id });
      const paidAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
      totalRemaining += Math.max(insurance.primeActuel - paidAmount, 0);
    }
    
    return totalRemaining;
  } catch (error) {
    console.error('Error calculating remaining payments:', error);
    return 0;
  }
}

// Recent insurances with client data
const getRecentInsurances = async (req, res) => {
  try {
    const userId = req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null;
    const admin = isAdmin(req.user);
    const { status = 'All', limit = 5 } = req.query;

    const query = { 
      ...(!admin && userId ? { createdby: userId } : {}),
      ...(status !== 'All' && { status }) 
    };

    const insurances = await Insurance.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('client', 'name firstName')  // Client data without joinby filter
      .lean();

    const formattedInsurances = insurances.map(insurance => ({
      ...insurance,
      clientName: insurance.client 
        ? `${insurance.client.firstName || ''} ${insurance.client.name || ''}`
        : 'N/A'
    }));

    res.status(200).json({ success: true, data: formattedInsurances });
  } catch (error) {
    console.error('Recent insurances error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent insurances',
      error: error.message
    });
  }
};

// Recent payments with full client data
const getRecentPayments = async (req, res) => {
  try {
    const userId = req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null;
    const admin = isAdmin(req.user);

    const payments = await Payment.aggregate([
      {
        $lookup: {
          from: 'insurances',
          localField: 'insurance',
          foreignField: '_id',
          as: 'insurance'
        }
      },
      { $unwind: { path: '$insurance', preserveNullAndEmptyArrays: true } },
      { 
        $match: !admin && userId ? { 
          'insurance.createdby': userId
        } : {} 
      },
      {
        $lookup: {
          from: 'clients',
          localField: 'insurance.client',
          foreignField: '_id',
          as: 'client'
        }
      },
      { $unwind: { path: '$client', preserveNullAndEmptyArrays: true } },
      { $sort: { paymentDate: -1 } },
      { $limit: parseInt(req.query.limit || 5) },
      {
        $project: {
          amount: 1,
          paymentDate: 1,
          paymentMethod: 1,
          reference: 1,
          insuranceId: '$insurance._id',
          clientName: {
            $ifNull: [
              { $concat: [{ $ifNull: ['$client.firstName', ''] }, ' ', { $ifNull: ['$client.name', ''] }]},
              'N/A' 
          ]
          }
        }
      }
    ]);

    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    console.error('Recent payments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recent payments',
      error: error.message
    });
  }
};

// Monthly revenue calculation
const getMonthlyRevenue = async (req, res) => {
  try {
    const userId = req.user?._id ? new mongoose.Types.ObjectId(req.user._id) : null;
    const admin = isAdmin(req.user);
    const { startDate, endDate } = req.query;

    // Date filters
    const paymentDateFilter = {};
    const insuranceDateFilter = {};

    if (startDate && endDate) {
      paymentDateFilter.paymentDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
      insuranceDateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // Common match conditions
    const paymentMatch = {
      ...(!admin && userId ? { 'insurance.createdby': userId } : {}),
      ...paymentDateFilter
    };

    const insuranceMatch = {
      ...(!admin && userId ? { createdby: userId } : {}),
      ...insuranceDateFilter,
      status: { $nin: ["Canceled", "Termination"] }
      // Only excludes "Canceled"
    };

    // Get both actual and projected data in parallel
    const [actualData, projectedData] = await Promise.all([
      // Actual revenue from payments
      Payment.aggregate([
        {
          $lookup: {
            from: 'insurances',
            localField: 'insurance',
            foreignField: '_id',
            as: 'insurance'
          }
        },
        { $unwind: '$insurance' },
        { $match: paymentMatch },
        {
          $group: {
            _id: {
              year: { $year: "$paymentDate" },
              month: { $month: "$paymentDate" }
            },
            actual: { $sum: "$amount" }
          }
        },
        {
          $project: {
            _id: 0,
            period: {
              $dateFromParts: {
                year: "$_id.year",
                month: "$_id.month",
                day: 1
              }
            },
            actual: 1
          }
        }
      ]),

      // Projected revenue from insurance primeTTC
      Insurance.aggregate([
        { $match: insuranceMatch },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            projected: { $sum: "$primeTTC" }
          }
        },
        {
          $project: {
            _id: 0,
            period: {
              $dateFromParts: {
                year: "$_id.year",
                month: "$_id.month",
                day: 1
              }
            },
            projected: 1
          }
        }
      ])
    ]);

    // Combine results
    const revenueMap = new Map();

    // Process actual payments
    actualData.forEach(item => {
      const key = item.period.toISOString();
      revenueMap.set(key, {
        period: item.period,
        actual: item.actual,
        projected: 0
      });
    });

    // Process projected revenue
    projectedData.forEach(item => {
      const key = item.period.toISOString();
      if (revenueMap.has(key)) {
        revenueMap.get(key).projected = item.projected;
      } else {
        revenueMap.set(key, {
          period: item.period,
          actual: 0,
          projected: item.projected
        });
      }
    });

    // Convert to sorted array
    const combinedData = Array.from(revenueMap.values()).sort((a, b) => 
      a.period - b.period
    );

    res.status(200).json({ 
      success: true, 
      data: combinedData 
    });
  } catch (error) {
    console.error('Monthly revenue error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching revenue data',
      error: error.message
    });
  }
}

module.exports = {
  getDashboardStats,
  getRecentInsurances,
  getRecentPayments,
  getMonthlyRevenue
};
// routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getRecentInsurances,
  getRecentPayments,
  getMonthlyRevenue
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/insurances', getRecentInsurances);
router.get('/payments', getRecentPayments);
router.get('/revenue', getMonthlyRevenue);

module.exports = router;
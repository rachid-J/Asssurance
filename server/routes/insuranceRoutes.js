const express = require('express');
const {
  getInsurances,
  createInsurance,
  updateInsurance,
  deleteInsurance,
  getInsuranceTotals,
  getInsuranceStats,
  renewInsurance,
  cancelInsurance,
  getInsuranceById,
  changeInsuranceTypeToResel,
  processRefund,
  getLatestExpiredInsurance
} = require('../controllers/insuranceController');
const { protect } = require('../middleware/authMiddleware');
const { restrictInsuranceAccess, canAccessInsurance } = require('../middleware/insuranceAuthMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);

// Routes with role-based access control
router.route('/')
  .get(restrictInsuranceAccess, getInsurances)  // Restrict insurance list based on user role
  .post(createInsurance);

router.route('/totals')
  .get(restrictInsuranceAccess, getInsuranceTotals);

router.route('/stats')
  .get(restrictInsuranceAccess, getInsuranceStats);

// Single insurance routes - check if user can access this specific insurance
router.route('/:id')
  .get(canAccessInsurance, getInsuranceById)
  .put(canAccessInsurance, updateInsurance)
  .delete(canAccessInsurance, deleteInsurance);

// Special operations on specific insurances
router.post('/:id/renew', canAccessInsurance, renewInsurance);
router.put('/:id/cancel', canAccessInsurance, cancelInsurance);
router.put('/:id/type-resel', changeInsuranceTypeToResel);
router.post('/:id/refund', processRefund);
router.get('/latest-expired/:vehicleId',getLatestExpiredInsurance);
module.exports = router;
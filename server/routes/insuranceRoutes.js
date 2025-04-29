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
  processRefund
} = require('../controllers/insuranceController'); // Changed controller reference
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
router.use(protect);
// Insurance routes (keeping policyNumber field as-is)
router.route('/')
  .get(getInsurances)       // Changed from getPolicies
  .post(createInsurance);   // Changed from createPolicy

router.route('/totals')
  .get(getInsuranceTotals); // Changed from getPolicyTotals



router.route('/stats')
  .get(getInsuranceStats);  // Changed from getPolicyStats

router.route('/:id')
  .get(getInsuranceById)    // Changed from getPolicyById
  .put(updateInsurance)     // Changed from updatePolicy
  .delete(deleteInsurance)
  // Changed from deletePolicy

// Renewal and cancellation routes
router.post('/:id/renew', protect,renewInsurance);    // Changed path and controller
router.put('/:id/cancel', protect,cancelInsurance);  // Changed path and controller

router.put('/:id/type-resel', protect ,changeInsuranceTypeToResel);
router.post('/:id/refund',protect, processRefund);



module.exports = router;
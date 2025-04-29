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
} = require('../controllers/insuranceController'); // Changed controller reference
const { getInsurancePayments, updatePayment } = require('../controllers/paymentController');
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
router.post('/:id/renew', renewInsurance);    // Changed path and controller
router.post('/:id/cancel', cancelInsurance);  // Changed path and controller

router.put('/:id/type-resel', changeInsuranceTypeToResel);



module.exports = router;
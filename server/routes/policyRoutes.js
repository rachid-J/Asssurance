const express = require('express');
const {
  getPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy,
  getPolicyTotals
} = require('../controllers/policyController');
const {
  getPolicyPayments,
  updatePayment,
  completeAllPayments
} = require('../controllers/paymentController');

const router = express.Router();

// Policy routes
router.route('/')
  .get(getPolicies)
  .post(createPolicy);

router.route('/totals')
  .get(getPolicyTotals);

router.route('/:id')
  .put(updatePolicy)
  .delete(deletePolicy);

// Payment routes
router.route('/:policyId/payments')
  .get(getPolicyPayments);

router.route('/:policyId/payments/complete')
  .post(completeAllPayments);

router.route('/:policyId/payments/:advanceNumber')
  .put(updatePayment);

module.exports = router;
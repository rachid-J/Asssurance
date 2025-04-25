const express = require('express');
const {
  getPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy,
  getPolicyTotals
} = require('../controllers/policyController');


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



module.exports = router;
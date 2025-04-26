const express = require('express');
const {
  getPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy,
  getPolicyTotals,
  getPolicyById,
  getPolicyStats,
  renewPolicy,
  cancelPolicy
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
  .delete(deletePolicy)
  .get(getPolicyById)

router.route('/stats')
 .get(getPolicyStats);

router.post('/policies/:id/renew', renewPolicy);
router.post('/policies/:id/cancel',cancelPolicy);

  router.put('/:id/cancel', async (req, res) => {
    try {
      const policy = await Policy.findById(req.params.id);
      if (!policy) return res.status(404).send();
      policy.status = 'canceled';
      await policy.save();
      res.send(policy);
    } catch (err) {
      res.status(500).send();
    }
  });

module.exports = router;
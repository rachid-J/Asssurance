// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');


// Apply authentication middleware to all payment routes


// Get all payments
router.get('/', paymentController.getAllPayments);

// Get payments for a specific policy
router.get('/:policyId', paymentController.getPolicyPayments);

// Create a new payment for a policy
router.post('/:policyId', paymentController.createPayment);

// Update a payment
router.put('/:paymentId', paymentController.updatePayment);

// Delete a payment
router.delete('/:paymentId', paymentController.deletePayment);

// Complete all payments for a policy (full payment)
router.post('/:policyId/complete', paymentController.completeAllPayments);

module.exports = router;
// routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');


// Apply authentication middleware to all payment routes

router.use(protect);
// Get all payments
router.get('/', paymentController.getAllPayments);

// Get payments for a specific policy
router.get('/:insuranceId', paymentController.getInsurancePayments);

// Create a new payment for a Insurance
router.post('/:insuranceId', paymentController.createPayment);

// Update a payment
router.put('/:paymentId', paymentController.updatePayment);

// Delete a payment
router.delete('/:paymentId', paymentController.deletePayment);

// Complete all payments for a Insurance (full payment)
router.post('/:insuranceId/complete', paymentController.completeAllPayments);

module.exports = router;
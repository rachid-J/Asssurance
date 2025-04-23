const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// Get all payments
router.get('/', paymentController.getPayments);

// Get single payment
router.get('/:id', paymentController.getPayment);

// Create new payment
router.post('/', paymentController.createPayment);

// Update payment
router.put('/:id', paymentController.updatePayment);

// Delete payment
router.delete('/:id', paymentController.deletePayment);

// Get payments by assurance case
router.get('/case/:caseId', paymentController.getPaymentsByCase);

module.exports = router;
// controllers/paymentController.js
const Payment = require('../models/Payment');
const Policy = require('../models/Policy');
const mongoose = require('mongoose');

// Get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('policy', 'policyNumber clientName')
      .sort({ paymentDate: -1 });
    
    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
};

// Get payments for a specific policy
exports.getPolicyPayments = async (req, res) => {
  try {
    const { policyId } = req.params;
    
    // Validate policyId format
    if (!mongoose.Types.ObjectId.isValid(policyId)) {
      return res.status(400).json({ message: 'Invalid policy ID format' });
    }
    
    const payments = await Payment.find({ policy: policyId })
      .sort({ advanceNumber: 1 });
    
    res.json(payments);
  } catch (error) {
    console.error(`Error fetching payments for policy ${req.params.policyId}:`, error);
    res.status(500).json({ message: 'Error fetching policy payments', error: error.message });
  }
};

// Create a new payment - simplified without session
exports.createPayment = async (req, res) => {
  try {
    const { policyId } = req.params;
    const paymentData = req.body;
    
    // Validate input
    if (!mongoose.Types.ObjectId.isValid(policyId)) {
      return res.status(400).json({ message: 'Invalid policy ID' });
    }
    
    // Validate required fields
    const requiredFields = ['advanceNumber', 'paymentDate', 'amount', 'paymentMethod'];
    const missing = requiredFields.filter(f => !paymentData[f]);
    if (missing.length > 0) {
      return res.status(400).json({ 
        message: `Missing required fields: ${missing.join(', ')}`
      });
    }

    // Check policy exists
    const policy = await Policy.findById(policyId);
    if (!policy) return res.status(404).json({ message: 'Policy not found' });

    // Handle existing payment
    const existingPayment = await Payment.findOneAndUpdate(
      { policy: policyId, advanceNumber: paymentData.advanceNumber },
      paymentData,
      { new: true, upsert: true }
    );

    // Update policy status
    const totalPaid = await Payment.aggregate([
      { $match: { policy: policy._id } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    
    await Policy.findByIdAndUpdate(policyId, {
      'paymentStatus.totalPaid': totalPaid[0]?.total || 0,
      'paymentStatus.isPaidInFull': totalPaid[0]?.total >= policy.primeTTC,
      'paymentStatus.lastPaymentDate': new Date()
    });

    res.status(200).json(existingPayment);
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ 
      message: 'Payment processing failed',
      error: error.message 
    });
  }
};

// Update a payment
exports.updatePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const updateData = req.body;
    
    // Validate paymentId format
    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ message: 'Invalid payment ID format' });
    }
    
    // Find and update the payment
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Update policy's payment status
    const policy = await Policy.findById(payment.policy);
    if (policy) {
      const totalPayments = await Payment.find({ policy: payment.policy });
      const totalPaid = totalPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      
      policy.paymentStatus = {
        totalPaid,
        isPaidInFull: Math.abs(totalPaid - policy.primeTTC) < 0.01,
        lastPaymentDate: new Date()
      };
      
      await policy.save();
    }
    
    res.json(payment);
  } catch (error) {
    console.error(`Error updating payment ${req.params.paymentId}:`, error);
    res.status(500).json({ message: 'Error updating payment', error: error.message });
  }
};

// Delete a payment
exports.deletePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    // Validate paymentId format
    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ message: 'Invalid payment ID format' });
    }
    
    // Find the payment first to get the policy reference
    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    const policyId = payment.policy;
    
    // Delete the payment
    await Payment.findByIdAndDelete(paymentId);
    
    // Update policy's payment status
    const policy = await Policy.findById(policyId);
    if (policy) {
      const totalPayments = await Payment.find({ policy: policyId });
      const totalPaid = totalPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      
      policy.paymentStatus = {
        totalPaid,
        isPaidInFull: Math.abs(totalPaid - policy.primeTTC) < 0.01,
        lastPaymentDate: totalPayments.length > 0 ? new Date() : null
      };
      
      await policy.save();
    }
    
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error(`Error deleting payment ${req.params.paymentId}:`, error);
    res.status(500).json({ message: 'Error deleting payment', error: error.message });
  }
};

// Complete all payments for a policy (full payment)
exports.completeAllPayments = async (req, res) => {
  try {
    const { policyId } = req.params;
    const { paymentDate, paymentMethod, reference, notes, totalAmount } = req.body;
    
    // Validate policyId format
    if (!mongoose.Types.ObjectId.isValid(policyId)) {
      return res.status(400).json({ message: 'Invalid policy ID format' });
    }
    
    // Check if the policy exists
    const policy = await Policy.findById(policyId);
    if (!policy) {
      return res.status(404).json({ message: 'Policy not found' });
    }
    
    // Find any existing payments
    const existingPayments = await Payment.find({ policy: policyId });
    
    // Delete existing payments if any
    if (existingPayments.length > 0) {
      await Payment.deleteMany({ policy: policyId });
    }
    
    // Create a single payment for the full amount
    const fullPayment = await Payment.create({
      policy: policyId,
      advanceNumber: 1,
      paymentDate: paymentDate || new Date(),
      amount: totalAmount || policy.primeTTC,
      paymentMethod: paymentMethod || 'cash',
      reference: reference || '',
      notes: (notes ? notes + ' ' : '') + '(Full payment)'
    });
    
    // Update policy's payment status
    policy.paymentStatus = {
      totalPaid: totalAmount || policy.primeTTC,
      isPaidInFull: true,
      lastPaymentDate: new Date()
    };
    
    await policy.save();
    
    res.status(201).json({
      message: 'All payments completed successfully',
      payment: fullPayment
    });
  } catch (error) {
    console.error('Error completing all payments:', error);
    res.status(500).json({ message: 'Error completing all payments', error: error.message });
  }
};
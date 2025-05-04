const Payment = require('../models/Payment');
const Insurance = require('../models/Insurance'); // Changed from Policy
const mongoose = require('mongoose');

// Get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: 'insurance',
        select: 'policyNumber client primeTTC primeActuel endDate ', // Keep policyNumber field
        populate: {
          path: 'client',
          select: 'name firstName'
        }
      })
      .sort({ paymentDate: -1 });
    
    // Map to maintain client name format
    const formattedPayments = payments.map(payment => ({
      ...payment.toObject(),
      clientName: payment.insurance?.client 
        ? `${payment.insurance.client.firstName} ${payment.insurance.client.name}`
        : 'N/A'
    }));
    
    res.json(formattedPayments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
};

exports.getInsurancePayments = async (req, res) => {
  try {
    const { insuranceId } = req.params; // Use consistent parameter name
    
    
    
    const payments = await Payment.find({ insurance: insuranceId })
      .sort({ advanceNumber: 1 });
    
    res.json(payments);
  } catch (error) {
    console.error(`Error fetching payments for insurance ${req.params.insuranceId}:`, error);
    res.status(500).json({ message: 'Error fetching insurance payments', error: error.message });
  }
};

// Create payment for insurance (maintain policy number)
exports.createPayment = async (req, res) => {
  try {
    const { insuranceId } = req.params; // Changed parameter
    const paymentData = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(insuranceId)) {
      return res.status(400).json({ message: 'Invalid insurance ID' });
    }

    // Check insurance exists
    const insurance = await Insurance.findById(insuranceId); // Changed model
    if (!insurance) return res.status(404).json({ message: 'Insurance not found' });

    // Create payment
    const payment = new Payment({
      ...paymentData,
      insurance: insuranceId // Changed field

    });

    await payment.save();

    // Update insurance payment status (assuming similar schema)
    const totalPaid = await Payment.aggregate([
      { $match: { insurance: insurance._id } }, // Changed field
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    
    await Insurance.findByIdAndUpdate(insuranceId, { // Update insurance document
      'paymentStatus.totalPaid': totalPaid[0]?.total || 0,
      'paymentStatus.isPaidInFull': totalPaid[0]?.total >= insurance.primeTTC,
      'paymentStatus.lastPaymentDate': new Date()
    });

    res.status(201).json(payment);
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ 
      message: 'Payment processing failed',
      error: error.message 
    });
  }
};

// Update payment (maintain insurance reference)
exports.updatePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const updateData = req.body;
    
    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    // Update insurance status
    const insurance = await Insurance.findById(payment.insurance); // Changed reference
    if (insurance) {
      const totalPayments = await Payment.find({ insurance: payment.insurance });
      const totalPaid = totalPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      
      insurance.paymentStatus = {
        totalPaid,
        isPaidInFull: Math.abs(totalPaid - insurance.primeTTC) < 0.01,
        lastPaymentDate: new Date()
      };
      
      await insurance.save();
    }
    
    res.json(payment);
  } catch (error) {
    console.error(`Error updating payment ${paymentId}:`, error);
    res.status(500).json({ message: 'Error updating payment', error: error.message });
  }
};

// Delete payment
exports.deletePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId);
    
    if (!payment) return res.status(404).json({ message: 'Payment not found' });
    
    const insuranceId = payment.insurance; // Changed variable name
    
    await Payment.findByIdAndDelete(paymentId);

    // Update insurance status
    const insurance = await Insurance.findById(insuranceId);
    if (insurance) {
      const totalPayments = await Payment.find({ insurance: insuranceId });
      const totalPaid = totalPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
      
      insurance.paymentStatus = {
        totalPaid,
        isPaidInFull: Math.abs(totalPaid - insurance.primeTTC) < 0.01,
        lastPaymentDate: totalPayments.length > 0 ? new Date() : null
      };
      
      await insurance.save();
    }
    
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    console.error(`Error deleting payment ${paymentId}:`, error);
    res.status(500).json({ message: 'Error deleting payment', error: error.message });
  }
};

// Complete all payments for insurance
exports.completeAllPayments = async (req, res) => {
  try {
    const { insuranceId } = req.params
    const { paymentDate, paymentMethod, reference, notes, totalAmount } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(insuranceId)) {
      return res.status(400).json({ message: 'Invalid insurance ID format' });
    }
    
    const insurance = await Insurance.findById(insuranceId); // Changed model
    if (!insurance) return res.status(404).json({ message: 'Insurance not found' });
    
    // Delete existing payments
    await Payment.deleteMany({ insurance: insuranceId });
    
    // Create full payment
    const fullPayment = await Payment.create({
      insurance: insuranceId, // Changed field
      advanceNumber: 1,
      paymentDate: paymentDate || new Date(),
      amount: totalAmount || insurance.primeTTC,
      paymentMethod: paymentMethod || 'cash',
      reference: reference || '',
      notes: (notes ? notes + ' ' : '') + '(Full payment)'
    });
    
    // Update insurance status
    insurance.paymentStatus = {
      totalPaid: totalAmount || insurance.primeTTC,
      isPaidInFull: true,
      lastPaymentDate: new Date()
    };
    
    await insurance.save();
    
    res.status(201).json({
      message: 'All payments completed successfully',
      payment: fullPayment
    });
  } catch (error) {
    console.error('Error completing all payments:', error);
    res.status(500).json({ message: 'Error completing all payments', error: error.message });
  }
};
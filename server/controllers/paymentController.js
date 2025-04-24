const Payment = require('../models/Payment');
const mongoose = require('mongoose');

const getPolicyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ policy: req.params.policyId })
      .sort('advanceNumber')
      .lean();
    
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching payments', error: error.message });
  }
};

const updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findOneAndUpdate(
      { policy: req.params.policyId, advanceNumber: req.body.advanceNumber },
      { paymentDate: req.body.paymentDate || null },
      { new: true, runValidators: true }
    );

    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    res.json(payment);
  } catch (error) {
    res.status(400).json({ message: 'Error updating payment', error: error.message });
  }
};

const completeAllPayments = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await Payment.updateMany(
      { policy: req.params.policyId, paymentDate: null },
      { $set: { paymentDate: new Date() } },
      { session }
    );

    await session.commitTransaction();
    const updatedPayments = await Payment.find({ policy: req.params.policyId });
    res.json(updatedPayments);
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: 'Error completing payments', error: error.message });
  } finally {
    session.endSession();
  }
};

module.exports = {
  getPolicyPayments,
  updatePayment,
  completeAllPayments
};
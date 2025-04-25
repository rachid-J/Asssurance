const Payment = require('../models/Payment');


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

const completeAllPayments = async (req, res) => {
  try {
    const { paymentDate, paymentMethod, reference, notes } = req.body;
    const policyId = req.params.policyId;

    // Validate required fields
    if (!paymentDate || !paymentMethod) {
      return res.status(400).json({ 
        message: 'Payment date and method are required'
      });
    }

    // Check if any advances exist
    const existingPayments = await Payment.find({ policy: policyId });
    
    // Create initial advance if none exist
    if (existingPayments.length === 0) {
      const policy = await Policy.findById(policyId);
      
      await Payment.create({
        policy: policyId,
        advanceNumber: 1,
        amount: policy.primeTTC,
        paymentDate: new Date(paymentDate),
        paymentMethod,
        reference,
        notes
      });
      
      return res.json(await Payment.find({ policy: policyId }));
    }

    // Update existing payments
    await Payment.updateMany(
      { policy: policyId, paymentDate: null },
      {
        paymentDate: new Date(paymentDate),
        paymentMethod,
        reference,
        notes
      }
    );

    const updatedPayments = await Payment.find({ policy: policyId });
    res.json(updatedPayments);
  } catch (error) {
    res.status(500).json({ 
      message: 'Error completing payments',
      error: error.message
    });
  }
};

// controllers/paymentController.js
const updatePayment = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const policyId = req.params.policyId;
    const advanceNumber = parseInt(req.params.advanceNumber, 10);
    
    // Validation
    if (isNaN(advanceNumber) || advanceNumber < 1 || advanceNumber > 4) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Invalid advance number (1-4 only)' });
    }

    const { paymentDate, amount, paymentMethod, reference, notes } = req.body;
    const amountValue = parseFloat(amount);

    // Get policy and existing payments
    const policy = await Policy.findById(policyId).session(session);
    const existingPayments = await Payment.find({ policy: policyId }).session(session);

    // Calculate total advances
    const currentTotal = existingPayments.reduce((sum, p) => sum + p.amount, 0);
    const newTotal = currentTotal + amountValue - 
      (existingPayments.find(p => p.advanceNumber === advanceNumber)?.amount || 0);

    // Validate against policy total
    if (newTotal > policy.primeTTC) {
      await session.abortTransaction();
      return res.status(400).json({
        message: `Total advances (${newTotal}) exceed policy amount (${policy.primeTTC})`
      });
    }

    // Upsert payment advance
    const payment = await Payment.findOneAndUpdate(
      { policy: policyId, advanceNumber },
      {
        amount: amountValue,
        paymentDate: paymentDate ? new Date(paymentDate) : null,
        paymentMethod,
        reference,
        notes
      },
      { 
        upsert: true,
        new: true,
        runValidators: true,
        session
      }
    );

    await session.commitTransaction();
    res.json(payment);

  } catch (error) {
    await session.abortTransaction();
    res.status(400).json({ 
      message: 'Error updating payment', 
      error: error.message 
    });
  } finally {
    session.endSession();
  }
};
module.exports = {
  getPolicyPayments,
  updatePayment,
  completeAllPayments
};


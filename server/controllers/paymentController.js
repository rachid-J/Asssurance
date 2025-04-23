const Payment = require('../models/Payment');
const AssuranceCase = require('../models/AssuranceCase');

// Get all payments
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate({
        path: 'assuranceCase',
        select: 'policy',
        populate: {
          path: 'client',
          select: 'name'
        }
      })
      .sort({ dueDate: 1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single payment
exports.getPayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id)
      .populate({
        path: 'assuranceCase',
        select: 'policy',
        populate: {
          path: 'client',
          select: 'name'
        }
      });
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create payment
exports.createPayment = async (req, res) => {
  const payment = new Payment({
    assuranceCase: req.body.assuranceCaseId,
    installmentNumber: req.body.installmentNumber,
    amount: req.body.amount,
    dueDate: req.body.dueDate,
    paymentDate: req.body.paymentDate,
    status: req.body.status,
    paymentMethod: req.body.paymentMethod,
    reference: req.body.reference
  });

  try {
    const newPayment = await payment.save();
    
    // Update assurance case balance if payment is marked as paid
    if (payment.status === 'Paid') {
      const assuranceCase = await AssuranceCase.findById(req.body.assuranceCaseId);
      if (assuranceCase) {
        assuranceCase.balance -= payment.amount;
        await assuranceCase.save();
      }
    }

    const populatedPayment = await Payment.findById(newPayment._id)
      .populate({
        path: 'assuranceCase',
        select: 'policy',
        populate: {
          path: 'client',
          select: 'name'
        }
      });
    res.status(201).json(populatedPayment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update payment
exports.updatePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    const oldStatus = payment.status;
    const oldAmount = payment.amount;

    Object.assign(payment, req.body);
    const updatedPayment = await payment.save();

    // Handle balance updates if payment status changes
    if (oldStatus !== updatedPayment.status || oldAmount !== updatedPayment.amount) {
      const assuranceCase = await AssuranceCase.findById(payment.assuranceCase);
      if (assuranceCase) {
        if (oldStatus === 'Paid') {
          assuranceCase.balance += oldAmount;
        }
        if (updatedPayment.status === 'Paid') {
          assuranceCase.balance -= updatedPayment.amount;
        }
        await assuranceCase.save();
      }
    }

    const populatedPayment = await Payment.findById(updatedPayment._id)
      .populate({
        path: 'assuranceCase',
        select: 'policy',
        populate: {
          path: 'client',
          select: 'name'
        }
      });
    res.json(populatedPayment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete payment
exports.deletePayment = async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }

    // Update assurance case balance if deleted payment was paid
    if (payment.status === 'Paid') {
      const assuranceCase = await AssuranceCase.findById(payment.assuranceCase);
      if (assuranceCase) {
        assuranceCase.balance += payment.amount;
        await assuranceCase.save();
      }
    }

    await payment.deleteOne();
    res.json({ message: 'Payment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get payments by assurance case
exports.getPaymentsByCase = async (req, res) => {
  try {
    const payments = await Payment.find({ assuranceCase: req.params.caseId })
      .populate({
        path: 'assuranceCase',
        select: 'policy',
        populate: {
          path: 'client',
          select: 'name'
        }
      })
      .sort({ dueDate: 1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
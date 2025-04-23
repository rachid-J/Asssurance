const AssuranceCase = require('../models/AssuranceCase');

// Get all cases
exports.getCases = async (req, res) => {
  try {
    const cases = await AssuranceCase.find()
      .populate('client', 'name')
      .sort({ createdAt: -1 });
    res.json(cases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single case
exports.getCase = async (req, res) => {
  try {
    const case_ = await AssuranceCase.findById(req.params.id)
      .populate('client', 'name');
    if (!case_) {
      return res.status(404).json({ message: 'Case not found' });
    }
    res.json(case_);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create case
exports.createCase = async (req, res) => {
  const case_ = new AssuranceCase({
    client: req.body.clientId,
    nature: req.body.nature,
    usage: req.body.usage,
    primeHT: req.body.primeHT,
    primeTTC: req.body.primeTTC,
    comment: req.body.comment,
    advances: req.body.advances || [],
    balance: req.body.balance,
    paymentMethod: req.body.paymentMethod
  });

  try {
    const newCase = await case_.save();
    const populatedCase = await AssuranceCase.findById(newCase._id)
      .populate('client', 'name');
    res.status(201).json(populatedCase);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Update case
exports.updateCase = async (req, res) => {
  try {
    const case_ = await AssuranceCase.findById(req.params.id);
    if (!case_) {
      return res.status(404).json({ message: 'Case not found' });
    }

    // Don't allow policy number to be changed
    delete req.body.policy;
    
    Object.assign(case_, req.body);
    const updatedCase = await case_.save();
    const populatedCase = await AssuranceCase.findById(updatedCase._id)
      .populate('client', 'name');
    res.json(populatedCase);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Delete case
exports.deleteCase = async (req, res) => {
  try {
    const case_ = await AssuranceCase.findById(req.params.id);
    if (!case_) {
      return res.status(404).json({ message: 'Case not found' });
    }

    await case_.deleteOne();
    res.json({ message: 'Case deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add advance payment
exports.addAdvance = async (req, res) => {
  try {
    const case_ = await AssuranceCase.findById(req.params.id);
    if (!case_) {
      return res.status(404).json({ message: 'Case not found' });
    }

    case_.advances.push({
      date: req.body.date,
      amount: req.body.amount
    });
    
    // Recalculate balance
    const totalAdvances = case_.advances.reduce((sum, advance) => sum + advance.amount, 0);
    case_.balance = case_.primeTTC - totalAdvances;

    const updatedCase = await case_.save();
    const populatedCase = await AssuranceCase.findById(updatedCase._id)
      .populate('client', 'name');
    res.json(populatedCase);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
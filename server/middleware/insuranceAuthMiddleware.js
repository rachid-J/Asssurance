// middleware/insuranceAuthMiddleware.js


// Middleware to restrict insurance visibility based on user role
exports.restrictInsuranceAccess = async (req, res, next) => {
  try {
    // Skip if no user is authenticated (though protect middleware should prevent this)
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Check if the user is an admin - admins can see all insurances
  

    // For non-admin users, automatically limit to only see their own created insurances
    if (!req.query.createdby) {
      req.query.createdby = req.user._id;
    } else {
      // If a user tries to access someone else's insurances, restrict them
      if (req.query.createdby.toString() !== req.user._id.toString()) {
        req.query.createdby = req.user._id; // Override the parameter to only show their own
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error in authorization check', error: error.message });
  }
};

// Middleware to check if user can access a specific insurance
exports.canAccessInsurance = async (req, res, next) => {
  try {
    // Skip if no user is authenticated
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // If user is admin, allow access
 

    // Get the insurance ID from request parameters
    const insuranceId = req.params.id;
    if (!insuranceId) {
      return res.status(400).json({ message: 'Insurance ID is required' });
    }

    // Import Insurance model here to avoid circular dependencies
    const Insurance = require('../models/Insurance');
    
    // Check if the user created this insurance
    const insurance = await Insurance.findById(insuranceId);
    
    if (!insurance) {
      return res.status(404).json({ message: 'Insurance not found' });
    }

    // Check if the current user created this insurance
    if (req.user.role !== 'admin' && insurance.createdby.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied. You can only access insurances you created.' });
    }
    

    // User can access this insurance
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error in insurance access check', error: error.message });
  }
};
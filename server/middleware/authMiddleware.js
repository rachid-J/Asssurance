const jwt = require('jsonwebtoken');
const User = require('../models/User');


exports.protect = async (req, res, next) => {
  let token;

  // Get token from HttpOnly cookie
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // Optionally also support Authorization header (for flexibility)


  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' });
    }

    next();
  } catch (error) {
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

async function checkActiveUser(req, res, next) {
  try {
    const user = await User.findById(req.user.id);
    if (!user || user.status !== 'Actif') {
      return res.status(401).json({ message: 'User is not active' });
    }
    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
}


// Only allow admins
exports.adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admins only.' });
  }
};

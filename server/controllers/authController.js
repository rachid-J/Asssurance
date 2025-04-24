const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    user.status = 'Actif';
    req.io.emit('user-status-change', { userId: user._id, status: 'Actif' });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // set true in production
      sameSite: 'Lax', // or 'None' if cross-site
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        status: user.status,
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
exports.me = async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.status = 'Actif';
    req.io.emit('user-status-change', { userId: user._id, status: 'Actif' });
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      status: user.status,
    });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token', error: err.message });
  }
};
exports.logoutUser = async (req, res) => {
    try {
      const token = req.cookies.token;
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        if (user) {
          user.status = 'Inactif';
          req.io.emit('user-status-change', { userId: user._id, status: 'Inactif' });
          await user.save();
        }
      }
  
      res.clearCookie('token');
      res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
      res.status(500).json({ message: 'Logout error', error: err.message });
    }
  };
  

   

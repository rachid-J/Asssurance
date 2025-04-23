const User = require('../models/User');
const bcrypt = require('bcryptjs');




exports.createUser = async (req, res) => {
    const { username, email, password } = req.body;
  
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) return res.status(400).json({ message: 'User already exists' });
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = await User.create({
        username,
        email,
        password: hashedPassword,
        role:'agent',
      });
      req.io.emit('user-added', newUser)
  
      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
        }
      });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  };

  exports.getUsers = async (req, res) => {
    try {
        // Get users excluding admins
        const users = await User.find({ 
            role: { $ne: 'admin' } // Exclude admin users
        }).sort({ createdAt: -1 });
        
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

exports.updateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        Object.assign(user, req.body);
        const updatedUser = await user.save();
        req.io.emit('user-updated', updatedUser);
        res.json(updatedUser);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}

exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Use deleteOne() instead of remove()
        await User.deleteOne({ _id: req.params.id });
        req.io.emit('user-deleted', req.params.id);
        
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

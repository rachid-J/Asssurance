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
        role: 'agent',
      });
      
      // Make sure req.io exists before emitting
      if (req.io) {
        console.log('Emitting user-added event');
        req.io.emit('user-added', newUser);
      } else {
        console.warn('req.io is not available in createUser controller');
      }
  
      res.status(201).json({
        message: 'User created successfully',
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status,
        }
      });
    } catch (err) {
      console.error('Error in createUser:', err);
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  };

  exports.getUsers = async (req, res) => {
    try {
        // Get users excluding admins and password field
        const users = await User.find({ 
            role: { $ne: 'admin' } 
        })
        .select('-password -__v') // Exclude password and version key
        .sort({ createdAt: -1 });

        res.json(users);
    } catch (error) {
        console.error('Error in getUsers:', error);
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
        console.error('Error in getUser:', error);
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
        
        // Make sure req.io exists before emitting
        if (req.io) {
            console.log('Emitting user-updated event');
            req.io.emit('user-updated', updatedUser);
        } else {
            console.warn('req.io is not available in updateUser controller');
        }
        
        res.json(updatedUser);
    } catch (error) {
        console.error('Error in updateUser:', error);
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
        
        // Make sure req.io exists before emitting
        if (req.io) {
            console.log('Emitting user-deleted event');
            req.io.emit('user-deleted', req.params.id);
        } else {
            console.warn('req.io is not available in deleteUser controller');
        }
        
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error in deleteUser:', error);
        res.status(500).json({ message: error.message });
    }
}
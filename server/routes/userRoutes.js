const express = require('express');
const { createUser ,getUsers, getUser,updateUser, deleteUser } = require('../controllers/userController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Admin can create users
router.get('/', protect, adminOnly, getUsers); // Admin can get all users
router.post('/create', protect, adminOnly, createUser);
router.get('/:id', protect, adminOnly, getUser); // Admin can get a user by ID
router.put('/:id', protect, adminOnly, updateUser); // Admin can update a user by ID
router.delete('/:id', protect, adminOnly,deleteUser);
module.exports = router;
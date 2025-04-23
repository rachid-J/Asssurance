const express = require('express');
const { loginUser } = require('../controllers/authController');

const router = express.Router();



// Public login route
router.post('/login', loginUser);

module.exports = router;

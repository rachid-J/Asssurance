const express = require('express');
const { loginUser, logoutUser, me } = require('../controllers/authController');

const router = express.Router();



// Public login route
router.post('/login', loginUser);
router.post('/logout',logoutUser);
router.get('/me',me);

module.exports = router;

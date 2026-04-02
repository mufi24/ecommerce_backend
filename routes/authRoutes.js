const express = require('express');
const router = express.Router();
const { signup, login, getMe, updateProfile } = require('../controllers/authController');
const { authenticate } = require('../middleware');

/**
 * Auth Routes
 * Base path: /api/auth
 */

// Public routes
router.post('/signup', signup);
router.post('/login', login);

// Protected routes
router.get('/me', authenticate, getMe);
router.put('/update-profile', authenticate, updateProfile);

module.exports = router;

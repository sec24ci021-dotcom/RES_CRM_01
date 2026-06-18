const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { authenticate } = require('../middleware/authMiddleware');

// Public
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refresh);

// Protected
router.get('/me', authenticate, AuthController.me);

module.exports = router;
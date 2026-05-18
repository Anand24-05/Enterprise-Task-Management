const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const validate = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.post('/signup', [
  body('userId').trim().isLength({ min: 3 }).withMessage('User ID must be at least 3 characters'),
  body('email').isEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
], validate, authController.signup);

router.get('/verify-email', authController.verifyEmail);

router.post('/login', [
  body('userId').notEmpty().withMessage('User ID required'),
  body('password').notEmpty().withMessage('Password required'),
], validate, authController.login);

router.post('/refresh-token', authController.refreshToken);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);

module.exports = router;

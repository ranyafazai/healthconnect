const express = require('express');
const router = express.Router();
const { register, login, logout, me } = require('../controllers/auth.controller');
const { body } = require('express-validator');
const authMiddleware = require('../middlewares/authMiddleware');

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('role').optional().isString(),
  ],
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
  ],
  login
);

router.post('/logout', authMiddleware, logout);
router.get('/me', authMiddleware, me);

module.exports = router;

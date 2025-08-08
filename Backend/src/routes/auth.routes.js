import express from 'express';
import { register, login, logout, me } from '../controllers/auth.controller.js';
import { body } from 'express-validator';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

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

export default router;

import express from 'express';
import { register, login, logout, me } from '../controllers/auth.controller.js';
import { body } from 'express-validator';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }), // Reduced from 8 to 6
    body('role').optional().isIn(['DOCTOR', 'PATIENT']),
    body('firstName').optional().isString().trim().isLength({ min: 1 }),
    body('lastName').optional().isString().trim().isLength({ min: 1 }),
    body('phone').optional().isString().trim(),
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

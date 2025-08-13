import express from 'express';
import userController from '../controllers/user.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { isDoctor, isPatient } from '../middlewares/roleCheck.js';
import { upload } from '../config/multer.js';

const router = express.Router();

// Get all users (admin only)
router.get('/', authMiddleware, userController.getAllUsers);

// Get current user profile - Must come before /:id
router.get('/me', authMiddleware, userController.getCurrentUser);

// Upload profile photo
router.post('/upload-photo', authMiddleware, (req, res, next) => {
  req.uploadType = 'avatar';
  next();
}, upload.single('photo'), userController.uploadProfilePhoto);

// Get user by ID - Must come last
router.get('/:id', authMiddleware, userController.getUserById);

// Update user
router.put('/:id', authMiddleware, userController.updateUser);

// Delete user
router.delete('/:id', authMiddleware, userController.deleteUser);

export default router;

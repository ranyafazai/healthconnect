import express from 'express';
import userController from '../controllers/user.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Account management routes
router.get('/export-data', authMiddleware, userController.exportUserData);
router.delete('/delete-account', authMiddleware, userController.deleteAccount);

export default router;

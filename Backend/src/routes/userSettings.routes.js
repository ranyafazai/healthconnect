import express from 'express';
import userSettingsController from '../controllers/userSettings.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Get user settings
router.get('/', authMiddleware, userSettingsController.getUserSettings);

// Update user settings
router.put('/', authMiddleware, userSettingsController.updateUserSettings);

export default router;


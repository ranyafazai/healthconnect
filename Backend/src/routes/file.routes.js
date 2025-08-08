import express from 'express';
import fileController from '../controllers/file.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Upload file
router.post('/', authMiddleware, fileController.uploadFile);

// Get all files (admin only) - Must come before /:id
router.get('/', authMiddleware, fileController.getAllFiles);

// Get files by owner - Must come before /:id
router.get('/owner/:ownerId', authMiddleware, fileController.getFilesByOwner);

// Get file by ID - Must come last
router.get('/:id', authMiddleware, fileController.getFileById);

// Update file
router.put('/:id', authMiddleware, fileController.updateFile);

// Delete file
router.delete('/:id', authMiddleware, fileController.deleteFile);

export default router;

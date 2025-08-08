import express from 'express';
import reviewController from '../controllers/review.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { isPatient } from '../middlewares/roleCheck.js';

const router = express.Router();

// Get reviews by doctor ID
router.get('/doctor/:doctorId', reviewController.getReviewsByDoctor);

// Get review by ID
router.get('/:id', reviewController.getReviewById);

// Create review
router.post('/', authMiddleware, isPatient, reviewController.createReview);

// Update review
router.put('/:id', authMiddleware, isPatient, reviewController.updateReview);

// Delete review
router.delete('/:id', authMiddleware, isPatient, reviewController.deleteReview);

export default router;

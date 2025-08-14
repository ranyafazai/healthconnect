import express from 'express';
import doctorController from '../controllers/doctor.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { isDoctor } from '../middlewares/roleCheck.js';

const router = express.Router();

// Get all doctors (public)
router.get('/', doctorController.getAllDoctors);

// Search doctors with filters (public)
router.get('/search', doctorController.searchDoctors);

// Get doctor dashboard data - Must come before /:id
router.get('/dashboard/data', authMiddleware, isDoctor, doctorController.getDoctorDashboard);

// Get doctor availability for a specific date (public)
router.get('/:id/availability', doctorController.getDoctorAvailability);

// Get doctor by ID (public) - Must come last
router.get('/:id', doctorController.getDoctorById);

// Create doctor profile
router.post('/', authMiddleware, isDoctor, doctorController.createDoctorProfile);

// Update doctor profile
router.put('/:id', authMiddleware, isDoctor, doctorController.updateDoctorProfile);

// Certifications management
router.post('/:id/certifications', authMiddleware, isDoctor, doctorController.addCertification);
router.delete('/:id/certifications/:certId', authMiddleware, isDoctor, doctorController.removeCertification);

// Delete doctor profile
router.delete('/:id', authMiddleware, isDoctor, doctorController.deleteDoctorProfile);

export default router;

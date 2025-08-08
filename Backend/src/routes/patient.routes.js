import express from 'express';
import patientController from '../controllers/patient.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { isPatient } from '../middlewares/roleCheck.js';

const router = express.Router();

// Get all patients (admin only)
router.get('/', authMiddleware, patientController.getAllPatients);

// Get patient dashboard data - Must come before /:id
router.get('/dashboard/data', authMiddleware, isPatient, patientController.getPatientDashboard);

// Get patient by ID - Must come last
router.get('/:id', authMiddleware, patientController.getPatientById);

// Create patient profile
router.post('/', authMiddleware, isPatient, patientController.createPatientProfile);

// Update patient profile
router.put('/:id', authMiddleware, isPatient, patientController.updatePatientProfile);

// Delete patient profile
router.delete('/:id', authMiddleware, isPatient, patientController.deletePatientProfile);

export default router;

import express from 'express';
import medicalRecordController from '../controllers/medicalRecord.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { isPatient } from '../middlewares/roleCheck.js';

const router = express.Router();

// Create medical record
router.post('/', authMiddleware, isPatient, medicalRecordController.createMedicalRecord);

// Get all medical records (admin only) - Must come before /:id
router.get('/', authMiddleware, medicalRecordController.getAllMedicalRecords);

// Get medical records by patient ID - Must come before /:id
router.get('/patient/:patientId', authMiddleware, medicalRecordController.getMedicalRecordsByPatient);

// Get medical record by ID - Must come last
router.get('/:id', authMiddleware, medicalRecordController.getMedicalRecordById);

// Update medical record
router.put('/:id', authMiddleware, isPatient, medicalRecordController.updateMedicalRecord);

// Delete medical record
router.delete('/:id', authMiddleware, isPatient, medicalRecordController.deleteMedicalRecord);

export default router;

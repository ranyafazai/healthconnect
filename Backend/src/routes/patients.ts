import express from 'express';
import { patientController } from '../controllers/patientController';

const router = express.Router();

// GET /api/patients - Get all patients
router.get('/', patientController.getAllPatients);

// GET /api/patients/:id - Get patient by ID
router.get('/:id', patientController.getPatientById);

// POST /api/patients - Create new patient
router.post('/', patientController.createPatient);

// DELETE /api/patients/:id - Delete patient
router.delete('/:id', patientController.deletePatient);

export default router;

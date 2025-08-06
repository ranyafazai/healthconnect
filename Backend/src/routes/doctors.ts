import express from 'express';
import { doctorController } from '../controllers/doctorController';

const router = express.Router();

// GET /api/doctors - Get all doctors
router.get('/', doctorController.getAllDoctors);

// GET /api/doctors/:id - Get doctor by ID
router.get('/:id', doctorController.getDoctorById);

// POST /api/doctors - Create new doctor
router.post('/', doctorController.createDoctor);

// PUT /api/doctors/:id - Update doctor
router.put('/:id', doctorController.updateDoctor);

// DELETE /api/doctors/:id - Delete doctor
router.delete('/:id', doctorController.deleteDoctor);

// GET /api/doctors/specialization/:specialization - Get doctors by specialization
router.get('/specialization/:specialization', doctorController.getDoctorsBySpecialization);

export default router;

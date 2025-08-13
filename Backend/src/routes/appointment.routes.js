import express from 'express';
import appointmentController from '../controllers/appointment.controller.js';
import authMiddleware from '../middlewares/authMiddleware.js';
import { isDoctor, isPatient } from '../middlewares/roleCheck.js';

const router = express.Router();

// Create a new appointment (POST)  
router.post('/', authMiddleware, appointmentController.createAppointment);

// Get all appointments (admin only) (GET) - Must come before /:id
router.get('/', authMiddleware, appointmentController.getAllAppointments);

// Get appointments by doctor ID (GET) - Must come before /:id
router.get('/doctor/:doctorId', authMiddleware, appointmentController.getAppointmentsByDoctor);

// Get appointments by patient ID (GET) - Must come before /:id
router.get('/patient/:patientId', authMiddleware, appointmentController.getAppointmentsByPatient);

// Get past consultations with enhanced details (GET) - Must come before /:id
router.get('/past-consultations/:patientId', authMiddleware, appointmentController.getPastConsultations);

// Get appointment by ID (GET) - Must come last
router.get('/:id', authMiddleware, appointmentController.getAppointmentById);

// Update appointment status (PATCH)
router.patch('/:id/status', authMiddleware, appointmentController.updateAppointmentStatus);

// Delete appointment (DELETE)
router.delete('/:id', authMiddleware, appointmentController.deleteAppointment);

export default router;

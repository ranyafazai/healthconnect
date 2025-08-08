import { prisma } from '../app.js';

// Middleware to check if user is a doctor
const isDoctor = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user || user.role !== 'DOCTOR') {
      return res.status(403).json({ error: 'Access denied. Doctors only.' });
    }

    // Add doctor profile to request
    req.doctorProfile = await prisma.doctorProfile.findUnique({
      where: { userId: user.id },
    });

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Middleware to check if user is a patient
const isPatient = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user || user.role !== 'PATIENT') {
      return res.status(403).json({ error: 'Access denied. Patients only.' });
    }

    // Add patient profile to request
    req.patientProfile = await prisma.patientProfile.findUnique({
      where: { userId: user.id },
    });

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Middleware to check if user is either a doctor or patient
const isDoctorOrPatient = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user || (user.role !== 'DOCTOR' && user.role !== 'PATIENT')) {
      return res.status(403).json({ error: 'Access denied. Invalid role.' });
    }

    if (user.role === 'DOCTOR') {
      req.doctorProfile = await prisma.doctorProfile.findUnique({
        where: { userId: user.id },
      });
    } else {
      req.patientProfile = await prisma.patientProfile.findUnique({
        where: { userId: user.id },
      });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { isDoctor, isPatient, isDoctorOrPatient };
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { config } from '../config/env';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, role, firstName, lastName } = req.body;

    if (!email || !password || !role || !firstName || !lastName) {
      const error = new Error('All fields are required');
      error.statusCode = 400;
      throw error;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const error = new Error('Email already registered');
      error.statusCode = 409;
      throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role,
      },
    });

    let profile = null;

    if (role === 'DOCTOR') {
      profile = await prisma.doctorProfile.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
          specialization: '',
          yearsExperience: 0,
          medicalLicense: '',
          availability: {}, // Ensure this matches your Prisma schema type
        },
      });
    } else if (role === 'PATIENT') {
      profile = await prisma.patientProfile.create({
        data: {
          userId: user.id,
          firstName,
          lastName,
        },
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      const error = new Error('Email and password are required');
      error.statusCode = 400;
      throw error;
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        doctorProfile: true,
        patientProfile: true,
      },
    });

    if (!user) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      const error = new Error('Invalid credentials');
      error.statusCode = 401;
      throw error;
    }

    // Remove password before sending user object (optional, not used in response)
    // const { password: _, ...userWithoutPassword } = user;

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      config.jwtSecret, // <-- FIXED: use config.jwtSecret
      { expiresIn: config.jwtExpiresIn } // <-- FIXED: use config.jwtExpiresIn
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.doctorProfile || user.patientProfile,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authenticateToken, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        doctorProfile: true,
        patientProfile: true,
      },
    });

    if (!user) {
      const error = new Error('User not found');
      error.statusCode = 404;
      throw error;
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: user.doctorProfile || user.patientProfile,
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;

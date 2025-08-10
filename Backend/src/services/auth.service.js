import { prisma } from '../app.js';
import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js';

export async function registerUser({ email, password, role, firstName, lastName, phone }) {
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) throw Object.assign(new Error('Email already registered'), { statusCode: 409 });

  const hash = await bcrypt.hash(password, 12);

  // Use a transaction to create both user and profile
  const result = await prisma.$transaction(async (tx) => {
    // Create the user
    const user = await tx.user.create({
      data: {
        email: email.toLowerCase(),
        password: hash,
        role: role || 'PATIENT', // Default role if not provided
      },
    });

    // Create the appropriate profile based on role
    if (role === 'DOCTOR') {
      await tx.doctorProfile.create({
        data: {
          userId: user.id,
          firstName: firstName || '',
          lastName: lastName || '',
          phoneNumber: phone || '',
          specialization: 'General Medicine', // Default specialization
          yearsExperience: 0, // Default experience
          medicalLicense: 'PENDING', // Will be updated later
          availability: { 
            monday: { available: false, hours: [] },
            tuesday: { available: false, hours: [] },
            wednesday: { available: false, hours: [] },
            thursday: { available: false, hours: [] },
            friday: { available: false, hours: [] },
            saturday: { available: false, hours: [] },
            sunday: { available: false, hours: [] }
          }, // Default empty availability
        },
      });
    } else {
      // Default to PATIENT
      await tx.patientProfile.create({
        data: {
          userId: user.id,
          firstName: firstName || '',
          lastName: lastName || '',
          phoneNumber: phone || '',
        },
      });
    }

    return user;
  });

  const token = generateToken({ id: result.id });

  return {
    token,
    safeUser: {
      id: result.id,
      email: result.email,
      role: result.role,
      createdAt: result.createdAt,
    },
  };
}

export async function loginUser({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (!user) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });

  const match = await bcrypt.compare(password, user.password);
  if (!match) throw Object.assign(new Error('Invalid credentials'), { statusCode: 401 });

  const token = generateToken({ id: user.id });

  return {
    token,
    safeUser: {
      id: user.id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    },
  };
}

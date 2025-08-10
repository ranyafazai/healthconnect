import { prisma } from '../app.js';
import bcrypt from 'bcryptjs';
import generateToken from '../utils/generateToken.js';

export async function registerUser({ email, password, role }) {
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) throw Object.assign(new Error('Email already registered'), { statusCode: 409 });

  const hash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      password: hash,
      role: role || 'PATIENT', // Default role if not provided
    },
  });

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

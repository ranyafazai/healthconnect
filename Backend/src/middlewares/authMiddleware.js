import jwt from 'jsonwebtoken';
import { prisma } from '../app.js';

export default async function (req, res, next) {
  try {
    console.log('Auth middleware - cookies:', req.cookies);
    console.log('Auth middleware - headers:', req.headers);
    const token = req.cookies?.token || (req.headers.authorization || '').replace('Bearer ', '');
    console.log('Auth middleware - token:', token ? 'present' : 'missing');
    if (!token) return res.status(401).json({ message: 'Not authenticated' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    
    // Fetch user with profile relationships
    const user = await prisma.user.findUnique({ 
      where: { id: payload.id },
      include: {
        patientProfile: true,
        doctorProfile: true
      }
    });
    
    if (!user) return res.status(401).json({ message: 'User not found' });
    const { password: _password, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}
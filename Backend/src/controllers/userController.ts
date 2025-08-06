import { Request, Response } from 'express';
import prisma from '../prisma';

export const userController = {
  // Get all users
  async getAllUsers(req: Request, res: Response) {
    try {
      const users = await prisma.user.findMany({
        include: {
          doctor: true,
          patient: true,
        },
      });
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  },

  // Get user by ID
  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
        include: {
          doctor: true,
          patient: true,
        },
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch user' });
    }
  },

  // Create new user
  async createUser(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName, phone, userType } = req.body;
      
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });
      
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }
      
      const user = await prisma.user.create({
        data: {
          email,
          password, // Note: In production, hash the password
          firstName,
          lastName,
          phone,
          userType,
        },
      });
      
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create user' });
    }
  },

  // Update user
  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { email, firstName, lastName, phone } = req.body;
      
      const user = await prisma.user.update({
        where: { id: parseInt(id) },
        data: {
          email,
          firstName,
          lastName,
          phone,
        },
      });
      
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update user' });
    }
  },

  // Delete user
  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      await prisma.user.delete({
        where: { id: parseInt(id) },
      });
      
      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  },
};

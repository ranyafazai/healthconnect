import { prisma } from '../app.js';
import { 
  successResponse, 
  errorResponse, 
  notFoundResponse, 
  serverErrorResponse,
  listResponse,
  userResponse
} from '../utils/responseFormatter.js';
import bcrypt from 'bcryptjs';

class UserController {
  // Get all users (admin only)
  async getAllUsers(req, res) {
    try {
      const users = await prisma.user.findMany({
        include: {
          doctorProfile: true,
          patientProfile: true
        }
      });

      return res.json(listResponse(users, 'Users retrieved successfully', users.length));
    } catch (error) {
      console.error('Get all users error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get users'));
    }
  }

  // Get user by ID
  async getUserById(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json(errorResponse('User ID is required', 400));
      }

      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
        include: {
          doctorProfile: true,
          patientProfile: true
        }
      });

      if (!user) {
        return res.status(404).json(notFoundResponse('User not found'));
      }

      return res.json(userResponse(user, true));
    } catch (error) {
      console.error('Get user error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get user'));
    }
  }

  // Update user
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { email, password, role } = req.body;

      if (!id) {
        return res.status(400).json(errorResponse('User ID is required', 400));
      }

      const updateData = {};
      if (email) updateData.email = email;
      if (role) updateData.role = role;
      if (password) {
        updateData.password = await bcrypt.hash(password, 10);
      }

      const user = await prisma.user.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          doctorProfile: true,
          patientProfile: true
        }
      });

      return res.json(userResponse(user, true));
    } catch (error) {
      console.error('Update user error:', error);
      return res.status(500).json(serverErrorResponse('Failed to update user'));
    }
  }

  // Delete user
  async deleteUser(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json(errorResponse('User ID is required', 400));
      }

      await prisma.user.delete({
        where: { id: parseInt(id) }
      });

      return res.json(successResponse(null, 'User deleted successfully'));
    } catch (error) {
      console.error('Delete user error:', error);
      return res.status(500).json(serverErrorResponse('Failed to delete user'));
    }
  }

  // Get current user profile
  async getCurrentUser(req, res) {
    try {
      const userId = req.user.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          doctorProfile: true,
          patientProfile: true
        }
      });

      if (!user) {
        return res.status(404).json(notFoundResponse('User not found'));
      }

      return res.json(userResponse(user, true));
    } catch (error) {
      console.error('Get current user error:', error);
      return res.status(500).json(serverErrorResponse('Failed to get current user'));
    }
  }
}

export default new UserController();

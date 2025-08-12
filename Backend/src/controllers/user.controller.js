import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import responseFormatter from '../utils/responseFormatter.js';

const prisma = new PrismaClient();

// Export user data
const exportUserData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get all user data including profiles, settings, appointments, etc.
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        patientProfile: true,
        doctorProfile: true,
        userSettings: true,
        notifications: true,
        messagesSent: {
          include: {
            receiver: {
              select: {
                id: true,
                email: true,
                patientProfile: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                },
                doctorProfile: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        },
        messagesReceived: {
          include: {
            sender: {
              select: {
                id: true,
                email: true,
                patientProfile: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                },
                doctorProfile: {
                  select: {
                    firstName: true,
                    lastName: true
                  }
                }
              }
            }
          }
        },
        files: true
      }
    });

    if (!userData) {
      return res.status(404).json(
        responseFormatter.errorResponse('User not found', 404)
      );
    }

    // Remove sensitive data
    const { password, ...safeUserData } = userData;

    // Create JSON file
    const jsonData = JSON.stringify(safeUserData, null, 2);
    const buffer = Buffer.from(jsonData, 'utf8');

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="user-data-${userId}-${Date.now()}.json"`);
    res.setHeader('Content-Length', buffer.length);

    return res.send(buffer);
  } catch (error) {
    console.error('Error exporting user data:', error);
    return res.status(500).json(
      responseFormatter.errorResponse('Failed to export user data', 500, error.message)
    );
  }
};

// Delete user account
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const { password } = req.body;

    if (!password) {
      return res.status(400).json(
        responseFormatter.validationErrorResponse('Password is required to delete account')
      );
    }

    // Get user with password to verify
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json(
        responseFormatter.errorResponse('User not found', 404)
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json(
        responseFormatter.errorResponse('Invalid password', 401)
      );
    }

    // Delete user and all related data (cascade delete)
    await prisma.user.delete({
      where: { id: userId }
    });

    return res.status(200).json(
      responseFormatter.successResponse(null, 'Account deleted successfully')
    );
  } catch (error) {
    console.error('Error deleting account:', error);
    return res.status(500).json(
      responseFormatter.errorResponse('Failed to delete account', 500, error.message)
    );
  }
};

export default {
  exportUserData,
  deleteAccount
};

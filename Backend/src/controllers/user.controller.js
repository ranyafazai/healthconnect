import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
// import { upload } from '../config/multer.js';
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
    const { password: _password, ...safeUserData } = userData;

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

// Get current user profile
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        doctorProfile: {
          include: {
            photo: true,
            certifications: {
              include: { file: true }
            }
          }
        },
        patientProfile: { include: { photo: true } },
        files: true
      }
    });

    if (!user) {
      return res.status(404).json(
        responseFormatter.errorResponse('User not found', 404)
      );
    }

    return res.json(
      responseFormatter.successResponse(user, 'User profile retrieved successfully')
    );
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json(
      responseFormatter.errorResponse('Failed to get current user', 500, error.message)
    );
  }
};

// Upload profile photo
const uploadProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.id;
    
    if (!req.file) {
      return res.status(400).json(
        responseFormatter.errorResponse('No file uploaded', 400)
      );
    }

    // Check if user already has a profile photo
    const existingPhoto = await prisma.file.findFirst({
      where: {
        ownerId: parseInt(userId),
        fileType: 'PROFILE_PICTURE'
      }
    });

    let fileRecord;
    const photoUrl = `/uploads/avatars/${req.file.filename}`;

    if (existingPhoto) {
      // Update existing photo
      fileRecord = await prisma.file.update({
        where: { id: existingPhoto.id },
        data: {
          url: photoUrl,
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        }
      });
    } else {
      // Create new photo record
      fileRecord = await prisma.file.create({
        data: {
          ownerId: parseInt(userId),
          url: photoUrl,
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          fileType: 'PROFILE_PICTURE'
        }
      });
    }

    // Link the uploaded file as the user's profile photo on their profile if present
    try {
      const userWithProfiles = await prisma.user.findUnique({
        where: { id: userId },
        include: { doctorProfile: true, patientProfile: true }
      });
      if (userWithProfiles?.doctorProfile?.id) {
        await prisma.doctorProfile.update({
          where: { id: userWithProfiles.doctorProfile.id },
          data: { photoId: fileRecord.id }
        });
      }
      if (userWithProfiles?.patientProfile?.id) {
        await prisma.patientProfile.update({
          where: { id: userWithProfiles.patientProfile.id },
          data: { photoId: fileRecord.id }
        });
      }
    } catch (linkErr) {
      console.error('Link profile photo error:', linkErr);
    }

    return res.json(
      responseFormatter.successResponse({
        photoUrl: photoUrl,
        fileId: fileRecord.id
      }, 'Profile photo uploaded successfully')
    );
  } catch (error) {
    console.error('Upload profile photo error:', error);
    return res.status(500).json(
      responseFormatter.errorResponse('Failed to upload profile photo', 500, error.message)
    );
  }
};

// Get all users (admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        doctorProfile: {
          select: {
            firstName: true,
            lastName: true,
            specialization: true
          }
        },
        patientProfile: {
          select: {
            firstName: true,
            lastName: true,
            dateOfBirth: true
          }
        }
      }
    });

    return res.json(
      responseFormatter.successResponse(users, 'Users retrieved successfully')
    );
  } catch (error) {
    console.error('Get all users error:', error);
    return res.status(500).json(
      responseFormatter.errorResponse('Failed to get users', 500, error.message)
    );
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return res.status(400).json(
        responseFormatter.errorResponse('Invalid user ID', 400)
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        doctorProfile: true,
        patientProfile: true
      }
    });

    if (!user) {
      return res.status(404).json(
        responseFormatter.errorResponse('User not found', 404)
      );
    }

    return res.json(
      responseFormatter.successResponse(user, 'User retrieved successfully')
    );
  } catch (error) {
    console.error('Get user by ID error:', error);
    return res.status(500).json(
      responseFormatter.errorResponse('Failed to get user', 500, error.message)
    );
  }
};

// Update user
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);
    const updateData = req.body;

    if (isNaN(userId)) {
      return res.status(400).json(
        responseFormatter.errorResponse('Invalid user ID', 400)
      );
    }

    // Remove sensitive fields that shouldn't be updated directly
    const { password, email, role, ...safeUpdateData } = updateData;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: safeUpdateData,
      include: {
        doctorProfile: true,
        patientProfile: true
      }
    });

    return res.json(
      responseFormatter.successResponse(updatedUser, 'User updated successfully')
    );
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json(
      responseFormatter.errorResponse('Failed to update user', 500, error.message)
    );
  }
};

// Delete user (admin only)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return res.status(400).json(
        responseFormatter.errorResponse('Invalid user ID', 400)
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json(
        responseFormatter.errorResponse('User not found', 404)
      );
    }

    // Delete user and all related data (cascade delete)
    await prisma.user.delete({
      where: { id: userId }
    });

    return res.json(
      responseFormatter.successResponse(null, 'User deleted successfully')
    );
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json(
      responseFormatter.errorResponse('Failed to delete user', 500, error.message)
    );
  }
};

export default {
  getAllUsers,
  exportUserData,
  deleteAccount,
  getCurrentUser,
  uploadProfilePhoto,
  getUserById,
  updateUser,
  deleteUser
};

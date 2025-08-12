import { PrismaClient } from '@prisma/client';
import responseFormatter from '../utils/responseFormatter.js';

const prisma = new PrismaClient();

 const getUserSettings = async (req, res) => {
  try {
    const userId = req.user.id;

    let userSettings = await prisma.userSettings.findUnique({
      where: { userId }
    });

    // If no settings exist, create default settings
    if (!userSettings) {
      userSettings = await prisma.userSettings.create({
        data: {
          userId,
          // Default values are set in the schema
        }
      });
    }

    return res.status(200).json(
      responseFormatter.successResponse(userSettings, 'User settings retrieved successfully')
    );
  } catch (error) {
    console.error('Error getting user settings:', error);
    return res.status(500).json(
      responseFormatter.errorResponse('Failed to retrieve user settings', 500, error.message)
    );
  }
};

 const updateUserSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      emailNotifications,
      smsNotifications,
      pushNotifications,
      appointmentReminders,
      messageNotifications,
      healthTips,
      marketingEmails,
      profileVisibility,
      shareMedicalHistory,
      allowDataAnalytics,
      shareForResearch,
      twoFactorAuth,
      sessionTimeout,
      loginNotifications
    } = req.body;

    // Validate session timeout
    if (sessionTimeout && ![15, 30, 60, 120].includes(sessionTimeout)) {
      return res.status(400).json(
        responseFormatter.validationErrorResponse('Invalid session timeout value')
      );
    }

    // Validate profile visibility
    if (profileVisibility && !['DOCTORS_ONLY', 'ALL_USERS', 'PRIVATE'].includes(profileVisibility)) {
      return res.status(400).json(
        responseFormatter.validationErrorResponse('Invalid profile visibility value')
      );
    }

    const updateData = {
      emailNotifications,
      smsNotifications,
      pushNotifications,
      appointmentReminders,
      messageNotifications,
      healthTips,
      marketingEmails,
      profileVisibility,
      shareMedicalHistory,
      allowDataAnalytics,
      shareForResearch,
      twoFactorAuth,
      sessionTimeout,
      loginNotifications
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );

    const userSettings = await prisma.userSettings.upsert({
      where: { userId },
      update: updateData,
      create: {
        userId,
        ...updateData
      }
    });

    return res.status(200).json(
      responseFormatter.updatedResponse(userSettings, 'User settings updated successfully')
    );
  } catch (error) {
    console.error('Error updating user settings:', error);
    return res.status(500).json(
      responseFormatter.errorResponse('Failed to update user settings', 500, error.message)
    );
  }
};

export default {
  getUserSettings,
  updateUserSettings
};
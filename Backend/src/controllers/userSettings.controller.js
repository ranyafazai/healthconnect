import { PrismaClient } from '@prisma/client';
import { responseFormatter } from '../utils/responseFormatter.js';

const prisma = new PrismaClient();

export const getUserSettings = async (req, res) => {
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
      responseFormatter.success('User settings retrieved successfully', userSettings)
    );
  } catch (error) {
    console.error('Error getting user settings:', error);
    return res.status(500).json(
      responseFormatter.error('Failed to retrieve user settings', error.message)
    );
  }
};

export const updateUserSettings = async (req, res) => {
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
        responseFormatter.error('Invalid session timeout value')
      );
    }

    // Validate profile visibility
    if (profileVisibility && !['DOCTORS_ONLY', 'ALL_USERS', 'PRIVATE'].includes(profileVisibility)) {
      return res.status(400).json(
        responseFormatter.error('Invalid profile visibility value')
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
      responseFormatter.success('User settings updated successfully', userSettings)
    );
  } catch (error) {
    console.error('Error updating user settings:', error);
    return res.status(500).json(
      responseFormatter.error('Failed to update user settings', error.message)
    );
  }
};

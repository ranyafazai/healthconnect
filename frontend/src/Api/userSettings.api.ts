import axios from '../lib/axios';

export interface UserSettings {
  id: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  
  // Notification settings
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;
  appointmentReminders: boolean;
  messageNotifications: boolean;
  healthTips: boolean;
  marketingEmails: boolean;
  
  // Privacy settings
  profileVisibility: 'DOCTORS_ONLY' | 'ALL_USERS' | 'PRIVATE';
  shareMedicalHistory: boolean;
  allowDataAnalytics: boolean;
  shareForResearch: boolean;
  
  // Security settings
  twoFactorAuth: boolean;
  sessionTimeout: number;
  loginNotifications: boolean;
}

export const getUserSettings = () => 
  axios.get<{ data: UserSettings }>('/user-settings');

export const updateUserSettings = (data: Partial<UserSettings>) => 
  axios.put<{ data: UserSettings }>('/user-settings', data);

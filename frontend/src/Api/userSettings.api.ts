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

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const getUserSettings = () => 
  axios.get<{ data: UserSettings }>('/user-settings');

export const updateUserSettings = (data: Partial<UserSettings>) => 
  axios.put<{ data: UserSettings }>('/user-settings', data);

// Account management APIs
export const changePassword = (data: ChangePasswordData) => 
  axios.put<{ message: string }>('/auth/change-password', data);

export const exportUserData = () => 
  axios.get('/user/export-data', { responseType: 'blob' });

export const deleteAccount = (password: string) => 
  axios.delete<{ message: string }>('/user/delete-account', { data: { password } });


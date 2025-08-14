import axios from '../lib/axios';
import type { User } from '../types/user';

export const getUserProfile = () => 
  axios.get<{ data: User }>('/users/me');

export const updateUserProfile = (data: Partial<User>) => 
  axios.put<{ data: User }>('/users/profile', data);

export const changePassword = (data: {
  currentPassword: string;
  newPassword: string;
}) => axios.patch('/users/change-password', data);

export const uploadProfilePhoto = (file: File) => {
  const formData = new FormData();
  formData.append('photo', file);
  return axios.post<{ data: { photoUrl: string; fileId: number } }>('/users/upload-photo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

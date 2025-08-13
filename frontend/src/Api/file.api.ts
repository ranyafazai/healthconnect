import axios from '../lib/axios';
import type { FileType } from '../types/data/file';

export const uploadFile = (file: File, fileType: FileType) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileType', fileType);
  
  return axios.post('/files', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const uploadProfilePhoto = (file: File) => {
  const formData = new FormData();
  formData.append('photo', file);
  
  return axios.post<{ data: { photoUrl: string; fileId: number } }>('/users/upload-photo', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const uploadMedicalDocument = (file: File) => {
  return uploadFile(file, 'MEDICAL_DOCUMENT');
};

export const uploadCertification = (file: File) => {
  return uploadFile(file, 'CERTIFICATION');
};

export const uploadConsultationRecording = (file: File) => {
  return uploadFile(file, 'CONSULTATION_RECORDING');
};

export const uploadChatMedia = (file: File) => {
  return uploadFile(file, 'CHAT_MEDIA');
};

export const getFiles = () => axios.get('/files');

export const getFileById = (id: number) => axios.get(`/files/${id}`);

export const deleteFile = (id: number) => axios.delete(`/files/${id}`);

export const updateFile = (id: number, data: { url?: string; fileType?: FileType }) => 
  axios.put(`/files/${id}`, data);

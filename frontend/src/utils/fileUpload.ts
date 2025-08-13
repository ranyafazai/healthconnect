export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];
export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain',
  'text/csv'
];

export const ALLOWED_CHAT_FILE_TYPES = [
  ...ALLOWED_IMAGE_TYPES,
  ...ALLOWED_VIDEO_TYPES,
  ...ALLOWED_DOCUMENT_TYPES
];

export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateFile = (file: File, maxSize: number = MAX_FILE_SIZE): FileValidationResult => {
  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size must be less than ${formatFileSize(maxSize)}`
    };
  }

  // Check file type
  if (!ALLOWED_CHAT_FILE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      error: 'File type not supported. Please upload images, videos, or documents.'
    };
  }

  return { isValid: true };
};

export const getFileType = (file: File): 'image' | 'video' | 'document' | 'other' => {
  if (ALLOWED_IMAGE_TYPES.includes(file.type)) return 'image';
  if (ALLOWED_VIDEO_TYPES.includes(file.type)) return 'video';
  if (ALLOWED_DOCUMENT_TYPES.includes(file.type)) return 'document';
  return 'other';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const generateFilePreview = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    } else {
      reject(new Error('Preview not available for this file type'));
    }
  });
};

export const getFileIcon = (fileType: string): string => {
  if (fileType.startsWith('image/')) return '🖼️';
  if (fileType.startsWith('video/')) return '🎥';
  if (fileType.startsWith('application/pdf')) return '📄';
  if (fileType.startsWith('application/msword') || fileType.includes('wordprocessingml')) return '📝';
  if (fileType.startsWith('application/vnd.ms-excel') || fileType.includes('spreadsheetml')) return '📊';
  if (fileType.startsWith('text/')) return '📄';
  return '📎';
};

export const sanitizeFileName = (fileName: string): string => {
  // Remove or replace invalid characters
  return fileName.replace(/[<>:"/\\|?*]/g, '_');
};

export const createFormData = (file: File, fileType: string): FormData => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('fileType', fileType);
  return formData;
};

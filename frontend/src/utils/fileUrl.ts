import config from '../config/env';

/**
 * Constructs a full URL for a file by combining the base URL with the relative file path
 * @param fileUrl - The relative file URL (e.g., '/uploads/messages/filename.png')
 * @returns The full URL for the file
 */
export const getFileUrl = (fileUrl: string): string => {
  if (!fileUrl) return '';
  
  // If it's already a full URL, return as is
  if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
    return fileUrl;
  }
  
  // Remove leading slash if present to avoid double slashes
  const cleanUrl = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
  
  // Combine base URL with file path
  return `${config.BASE_URL}/${cleanUrl}`;
};

/**
 * Constructs a full URL for an uploaded file
 * @param file - The file object with url property
 * @returns The full URL for the file
 */
export const getUploadedFileUrl = (file: { url?: string } | null | undefined): string => {
  if (!file?.url) return '';
  return getFileUrl(file.url);
};

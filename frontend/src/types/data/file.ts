export const FileType = {
  PROFILE_PICTURE: 'PROFILE_PICTURE',
  CONSULTATION_RECORDING: 'CONSULTATION_RECORDING',
  MEDICAL_DOCUMENT: 'MEDICAL_DOCUMENT',
  CHAT_MEDIA: 'CHAT_MEDIA',
  CERTIFICATION: 'CERTIFICATION'
} as const;

export type FileType = typeof FileType[keyof typeof FileType];

export interface File {
  id: number;
  userId: number;
  type: FileType;
  name: string;
  path: string;
  url?: string; // Backend returns this field
  mimeType: string;
  size: number;
  createdAt: Date;
  updatedAt: Date;
}

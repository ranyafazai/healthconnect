import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'default-secret',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  uploadPath: process.env.UPLOAD_PATH || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'),
};

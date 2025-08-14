import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server Configuration
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  
  // Database Configuration
  DATABASE_URL: process.env.DATABASE_URL,
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  JWT_EXPIRES_MS: process.env.JWT_EXPIRES_MS || '86400000',
  
  // File Upload Configuration
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
  UPLOAD_PATH: process.env.UPLOAD_PATH || './uploads',
  ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES?.split(',') || [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'text/plain',
    'video/mp4',
    'video/webm'
  ],
  
  // Cloud Storage Configuration (AWS S3)
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION || 'us-east-1',
  AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
  
  // Cloud Storage Configuration (Cloudinary)
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
  
  // Email Configuration
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT) || 587,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@healthyconnect.com',
  
  // SMS Configuration (Twilio)
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
  
  // Payment Configuration (Stripe)
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  
  // WebRTC Configuration
  TURN_SERVER_URL: process.env.TURN_SERVER_URL,
  TURN_USERNAME: process.env.TURN_USERNAME,
  TURN_CREDENTIAL: process.env.TURN_CREDENTIAL,
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FILE_PATH: process.env.LOG_FILE_PATH || './logs',
  
  // Security
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  SESSION_SECRET: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
  
  // Appointments
  APPOINTMENT_REMINDER_HOURS: parseInt(process.env.APPOINTMENT_REMINDER_HOURS) || 24,
  APPOINTMENT_CANCELLATION_HOURS: parseInt(process.env.APPOINTMENT_CANCELLATION_HOURS) || 2,
  
  // Video Calls
  VIDEO_CALL_TIMEOUT_MINUTES: parseInt(process.env.VIDEO_CALL_TIMEOUT_MINUTES) || 60,
  MAX_VIDEO_CALL_PARTICIPANTS: parseInt(process.env.MAX_VIDEO_CALL_PARTICIPANTS) || 2,
  
  // Notifications
  PUSH_NOTIFICATION_PUBLIC_KEY: process.env.PUSH_NOTIFICATION_PUBLIC_KEY,
  PUSH_NOTIFICATION_PRIVATE_KEY: process.env.PUSH_NOTIFICATION_PRIVATE_KEY,
  
  // Feature Flags
  ENABLE_VIDEO_CALLS: process.env.ENABLE_VIDEO_CALLS !== 'false',
  ENABLE_FILE_UPLOADS: process.env.ENABLE_FILE_UPLOADS !== 'false',
  ENABLE_NOTIFICATIONS: process.env.ENABLE_NOTIFICATIONS !== 'false',
  ENABLE_PAYMENTS: process.env.ENABLE_PAYMENTS !== 'false',
  ENABLE_SMS: process.env.ENABLE_SMS !== 'false',
  ENABLE_EMAIL: process.env.ENABLE_EMAIL !== 'false'
};

// Validation function to check required environment variables
export const validateEnv = () => {
  const required = [
    'DATABASE_URL',
    'JWT_SECRET'
  ];
  
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Validate email configuration if enabled
  if (config.ENABLE_EMAIL) {
    const emailRequired = ['EMAIL_HOST', 'EMAIL_USER', 'EMAIL_PASS'];
    const emailMissing = emailRequired.filter(key => !process.env[key]);
    if (emailMissing.length > 0) {
      console.warn(`Email notifications disabled - missing: ${emailMissing.join(', ')}`);
      config.ENABLE_EMAIL = false;
    }
  }
  
  // Validate SMS configuration if enabled
  if (config.ENABLE_SMS) {
    const smsRequired = ['TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN', 'TWILIO_PHONE_NUMBER'];
    const smsMissing = smsRequired.filter(key => !process.env[key]);
    if (smsMissing.length > 0) {
      console.warn(`SMS notifications disabled - missing: ${smsMissing.join(', ')}`);
      config.ENABLE_SMS = false;
    }
  }
  
  // Validate payment configuration if enabled
  if (config.ENABLE_PAYMENTS) {
    const paymentRequired = ['STRIPE_SECRET_KEY', 'STRIPE_PUBLISHABLE_KEY'];
    const paymentMissing = paymentRequired.filter(key => !process.env[key]);
    if (paymentMissing.length > 0) {
      console.warn(`Payments disabled - missing: ${paymentMissing.join(', ')}`);
      config.ENABLE_PAYMENTS = false;
    }
  }
  

};

export default config;

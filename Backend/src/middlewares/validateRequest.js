import { validationResult } from 'express-validator';
import { AppError } from './errorHandler.js';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    throw new AppError('Validation failed', 400);
  }
  
  next();
};

// Common validation rules
export const commonValidations = {
  email: {
    isEmail: true,
    normalizeEmail: true,
    errorMessage: 'Please provide a valid email address'
  },
  password: {
    isLength: {
      options: { min: 8 },
      errorMessage: 'Password must be at least 8 characters long'
    }
  },
  phoneNumber: {
    matches: {
      options: /^[\+]?[1-9][\d]{0,15}$/,
      errorMessage: 'Please provide a valid phone number'
    }
  },
  dateOfBirth: {
    isISO8601: true,
    toDate: true,
    errorMessage: 'Please provide a valid date of birth'
  },
  rating: {
    isInt: {
      options: { min: 1, max: 5 },
      errorMessage: 'Rating must be between 1 and 5'
    }
  },
  appointmentDate: {
    isISO8601: true,
    toDate: true,
    custom: {
      options: (value) => {
        const now = new Date();
        const appointmentDate = new Date(value);
        if (appointmentDate <= now) {
          throw new Error('Appointment date must be in the future');
        }
        return true;
      }
    }
  }
};

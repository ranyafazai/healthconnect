/**
 * Response Formatter Utility
 * Standardizes API responses across the application
 */

// Success response formatter
export const successResponse = (data, message = 'Success', statusCode = 200) => {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
    statusCode
  };
};

// Error response formatter
export const errorResponse = (message = 'An error occurred', statusCode = 500, errors = null) => {
  const response = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
    statusCode
  };

  if (errors) {
    response.errors = errors;
  }

  return response;
};

// Pagination response formatter
export const paginatedResponse = (data, page, limit, total, message = 'Data retrieved successfully') => {
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  return {
    success: true,
    message,
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages,
      hasNextPage,
      hasPrevPage,
      nextPage: hasNextPage ? page + 1 : null,
      prevPage: hasPrevPage ? page - 1 : null
    },
    timestamp: new Date().toISOString(),
    statusCode: 200
  };
};

// List response formatter
export const listResponse = (data, message = 'List retrieved successfully', count = null) => {
  const response = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
    statusCode: 200
  };

  if (count !== null) {
    response.count = count;
  }

  return response;
};

// Created response formatter
export const createdResponse = (data, message = 'Resource created successfully') => {
  return successResponse(data, message, 201);
};

// Updated response formatter
export const updatedResponse = (data, message = 'Resource updated successfully') => {
  return successResponse(data, message, 200);
};

// Deleted response formatter
export const deletedResponse = (message = 'Resource deleted successfully') => {
  return successResponse(null, message, 200);
};

// Validation error response formatter
export const validationErrorResponse = (errors, message = 'Validation failed') => {
  return errorResponse(message, 400, errors);
};

// Not found response formatter
export const notFoundResponse = (message = 'Resource not found') => {
  return errorResponse(message, 404);
};

// Unauthorized response formatter
export const unauthorizedResponse = (message = 'Unauthorized access') => {
  return errorResponse(message, 401);
};

// Forbidden response formatter
export const forbiddenResponse = (message = 'Access forbidden') => {
  return errorResponse(message, 403);
};

// Conflict response formatter
export const conflictResponse = (message = 'Resource conflict') => {
  return errorResponse(message, 409);
};

// Server error response formatter
export const serverErrorResponse = (message = 'Internal server error') => {
  return errorResponse(message, 500);
};

// Custom response formatter
export const customResponse = (success, data, message, statusCode, additionalFields = {}) => {
  const response = {
    success,
    message,
    timestamp: new Date().toISOString(),
    statusCode
  };

  if (data !== null && data !== undefined) {
    response.data = data;
  }

  // Add any additional fields
  Object.assign(response, additionalFields);

  return response;
};

// Socket response formatter
export const socketResponse = (event, data, success = true, message = null) => {
  const response = {
    event,
    success,
    data,
    timestamp: new Date().toISOString()
  };

  if (message) {
    response.message = message;
  }

  return response;
};

// File upload response formatter
export const fileUploadResponse = (file, message = 'File uploaded successfully') => {
  return successResponse({
    filename: file.filename,
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    url: file.url || null
  }, message, 201);
};

// Appointment response formatter
export const appointmentResponse = (appointment, includeDetails = false) => {
  const baseData = {
    id: appointment.id,
    date: appointment.date,
    status: appointment.status,
    type: appointment.type,
    reason: appointment.reason,
    createdAt: appointment.createdAt
  };

  if (includeDetails) {
    baseData.doctor = appointment.doctor;
    baseData.patient = appointment.patient;
    baseData.messages = appointment.messages;
    baseData.recording = appointment.recording;
  }

  return successResponse(baseData, 'Appointment retrieved successfully');
};

// Doctor response formatter
export const doctorResponse = (doctor, includeDetails = false) => {
  const baseData = {
    id: doctor.id,
    userId: doctor.userId,
    firstName: doctor.firstName,
    lastName: doctor.lastName,
    specialization: doctor.specialization,
    yearsExperience: doctor.yearsExperience,
    medicalLicense: doctor.medicalLicense,
    officeAddress: doctor.officeAddress,
    city: doctor.city,
    state: doctor.state,
    zipCode: doctor.zipCode,
    phoneNumber: doctor.phoneNumber,
    emergencyContact: doctor.emergencyContact,
    availability: doctor.availability,
    avgReview: doctor.avgReview,
    photo: doctor.photo,
    user: doctor.user
  };

  if (includeDetails) {
    baseData.professionalBio = doctor.professionalBio;
    baseData.certifications = doctor.certifications;
    baseData.reviews = doctor.reviews;
    baseData.user = doctor.user;
  }

  return successResponse(baseData, 'Doctor retrieved successfully');
};

// Patient response formatter
export const patientResponse = (patient, includeDetails = false) => {
  const baseData = {
    id: patient.id,
    firstName: patient.firstName,
    lastName: patient.lastName,
    dateOfBirth: patient.dateOfBirth,
    photo: patient.photo
  };

  if (includeDetails) {
    baseData.phoneNumber = patient.phoneNumber;
    baseData.address = patient.address;
    baseData.medicalHistory = patient.medicalHistory;
    baseData.appointments = patient.appointments;
    baseData.medicalRecords = patient.medicalRecords;
  }

  return successResponse(baseData, 'Patient retrieved successfully');
};

// Message response formatter
export const messageResponse = (message, includeDetails = false) => {
  const baseData = {
    id: message.id,
    content: message.content,
    type: message.type,
    isRead: message.isRead,
    createdAt: message.createdAt
  };

  if (includeDetails) {
    baseData.sender = message.sender;
    baseData.receiver = message.receiver;
    baseData.appointment = message.appointment;
    baseData.file = message.file;
  }

  return successResponse(baseData, 'Message retrieved successfully');
};

// Review response formatter
export const reviewResponse = (review, includeDetails = false) => {
  const baseData = {
    id: review.id,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt
  };

  if (includeDetails) {
    baseData.doctor = review.doctor;
    baseData.patient = review.patient;
  }

  return successResponse(baseData, 'Review retrieved successfully');
};

// Notification response formatter
export const notificationResponse = (notification) => {
  return successResponse({
    id: notification.id,
    type: notification.type,
    content: notification.content,
    isRead: notification.isRead,
    createdAt: notification.createdAt
  }, 'Notification retrieved successfully');
};

// Video call response formatter
export const videoCallResponse = (videoCall, includeDetails = false) => {
  const baseData = {
    id: videoCall.id,
    status: videoCall.status,
    roomId: videoCall.roomId,
    startTime: videoCall.startTime,
    endTime: videoCall.endTime,
    createdAt: videoCall.createdAt
  };

  if (includeDetails) {
    baseData.message = videoCall.message;
  }

  return successResponse(baseData, 'Video call retrieved successfully');
};

// Medical record response formatter
export const medicalRecordResponse = (medicalRecord, includeDetails = false) => {
  const baseData = {
    id: medicalRecord.id,
    title: medicalRecord.title,
    description: medicalRecord.description,
    createdAt: medicalRecord.createdAt
  };

  if (includeDetails) {
    baseData.patient = medicalRecord.patient;
    baseData.file = medicalRecord.file;
  }

  return successResponse(baseData, 'Medical record retrieved successfully');
};

// File response formatter
export const fileResponse = (file) => {
  return successResponse({
    id: file.id,
    url: file.url,
    fileType: file.fileType,
    createdAt: file.createdAt
  }, 'File retrieved successfully');
};

// User response formatter
export const userResponse = (user, includeDetails = false) => {
  const baseData = {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  };

  if (includeDetails) {
    baseData.doctorProfile = user.doctorProfile;
    baseData.patientProfile = user.patientProfile;
  }

  return successResponse(baseData, 'User retrieved successfully');
};

// Export all formatters
export default {
  successResponse,
  errorResponse,
  paginatedResponse,
  listResponse,
  createdResponse,
  updatedResponse,
  deletedResponse,
  validationErrorResponse,
  notFoundResponse,
  unauthorizedResponse,
  forbiddenResponse,
  conflictResponse,
  serverErrorResponse,
  customResponse,
  socketResponse,
  fileUploadResponse,
  appointmentResponse,
  doctorResponse,
  patientResponse,
  messageResponse,
  reviewResponse,
  notificationResponse,
  videoCallResponse,
  medicalRecordResponse,
  fileResponse,
  userResponse
};

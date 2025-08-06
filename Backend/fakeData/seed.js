const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Helper function to hash passwords
async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

// Realistic doctor data
const doctors = [
  {
    email: 'dr.sarah.johnson@healthyconnect.com',
    password: 'SecureDoc2024!',
    role: 'DOCTOR',
    doctorProfile: {
      firstName: 'Sarah',
      lastName: 'Johnson',
      professionalBio: 'Board-certified cardiologist with 12 years of experience specializing in preventive cardiology and heart failure management. Passionate about patient education and digital health solutions.',
      specialization: 'Cardiology',
      yearsExperience: 12,
      medicalLicense: 'MD-CA-78432',
      certifications: 'Board Certified in Cardiovascular Disease, Certified in Echocardiography',
      officeAddress: '123 Medical Center Drive, Suite 400',
      city: 'San Francisco',
      state: 'California',
      zipCode: '94102',
      phoneNumber: '+1-415-555-0123',
      emergencyContact: '+1-415-555-0124',
      availability: {
        monday: ['08:00-12:00', '13:00-17:00'],
        tuesday: ['08:00-12:00', '13:00-17:00'],
        wednesday: ['08:00-12:00', '13:00-17:00'],
        thursday: ['08:00-12:00', '13:00-17:00'],
        friday: ['08:00-12:00', '13:00-16:00']
      }
    }
  },
  {
    email: 'dr.michael.chen@healthyconnect.com',
    password: 'SecureDoc2024!',
    role: 'DOCTOR',
    doctorProfile: {
      firstName: 'Michael',
      lastName: 'Chen',
      professionalBio: 'Experienced family medicine physician with expertise in chronic disease management and preventive care. Strong advocate for telemedicine and accessible healthcare.',
      specialization: 'Family Medicine',
      yearsExperience: 8,
      medicalLicense: 'MD-NY-56789',
      certifications: 'Board Certified in Family Medicine, Certified in Telemedicine',
      officeAddress: '456 Health Plaza, Suite 200',
      city: 'New York',
      state: 'New York',
      zipCode: '10001',
      phoneNumber: '+1-212-555-0456',
      emergencyContact: '+1-212-555-0457',
      availability: {
        monday: ['08:00-12:00', '13:00-17:00'],
        tuesday: ['08:00-12:00', '13:00-17:00'],
        wednesday: ['08:00-12:00', '13:00-17:00'],
        thursday: ['08:00-12:00', '13:00-17:00'],
        friday: ['08:00-12:00', '13:00-16:00']
      }
    }
  },
  {
    email: 'dr.emily.rodriguez@healthyconnect.com',
    password: 'SecureDoc2024!',
    role: 'DOCTOR',
    doctorProfile: {
      firstName: 'Emily',
      lastName: 'Rodriguez',
      professionalBio: 'Dermatologist specializing in skin cancer detection, cosmetic dermatology, and advanced laser treatments. Committed to providing personalized skincare solutions.',
      specialization: 'Dermatology',
      yearsExperience: 10,
      medicalLicense: 'MD-TX-34567',
      certifications: 'Board Certified in Dermatology, Fellowship in Cosmetic Dermatology',
      officeAddress: '789 Wellness Boulevard, Suite 300',
      city: 'Austin',
      state: 'Texas',
      zipCode: '78701',
      phoneNumber: '+1-512-555-0789',
      emergencyContact: '+1-512-555-0790',
      availability: {
        monday: ['09:00-12:00', '14:00-18:00'],
        tuesday: ['09:00-12:00', '14:00-18:00'],
        wednesday: ['09:00-12:00', '14:00-18:00'],
        thursday: ['09:00-12:00', '14:00-18:00'],
        friday: ['09:00-12:00', '14:00-17:00']
      }
    }
  }
];

// Realistic patient data
const patients = [
  {
    email: 'james.wilson@email.com',
    password: 'PatientPass123!',
    role: 'PATIENT',
    patientProfile: {
      firstName: 'James',
      lastName: 'Wilson',
      phoneNumber: '+1-415-555-2024',
      dateOfBirth: new Date('1985-03-15'),
      address: '789 Pine Street, Apt 4B',
      city: 'San Francisco',
      state: 'California',
      zipCode: '94103',
      medicalHistory: 'Hypertension, seasonal allergies. No known drug allergies.'
    }
  },
  {
    email: 'maria.garcia@email.com',
    password: 'PatientPass123!',
    role: 'PATIENT',
    patientProfile: {
      firstName: 'Maria',
      lastName: 'Garcia',
      phoneNumber: '+1-212-555-2025',
      dateOfBirth: new Date('1990-07-22'),
      address: '321 Oak Avenue',
      city: 'New York',
      state: 'New York',
      zipCode: '10002',
      medicalHistory: 'Type 2 diabetes, managed with medication and diet. Recent flu vaccination.'
    }
  },
  {
    email: 'david.kim@email.com',
    password: 'PatientPass123!',
    role: 'PATIENT',
    patientProfile: {
      firstName: 'David',
      lastName: 'Kim',
      phoneNumber: '+1-512-555-2026',
      dateOfBirth: new Date('1978-11-08'),
      address: '654 Elm Street',
      city: 'Austin',
      state: 'Texas',
      zipCode: '78702',
      medicalHistory: 'Asthma since childhood, well-controlled with inhalers. Exercise-induced symptoms.'
    }
  },
  {
    email: 'sarah.thompson@email.com',
    password: 'PatientPass123!',
    role: 'PATIENT',
    patientProfile: {
      firstName: 'Sarah',
      lastName: 'Thompson',
      phoneNumber: '+1-415-555-2027',
      dateOfBirth: new Date('1992-05-30'),
      address: '246 Maple Drive',
      city: 'San Francisco',
      state: 'California',
      zipCode: '94104',
      medicalHistory: 'Anxiety disorder, managed with therapy and medication. Generally healthy otherwise.'
    }
  }
];

// Realistic appointment data
const getAppointmentData = (doctorIds, patientIds) => [
  {
    doctorId: doctorIds[0], // Dr. Sarah Johnson
    patientId: patientIds[0], // James Wilson
    date: new Date('2024-01-15T10:00:00'),
    status: 'COMPLETED',
    type: 'VIDEO',
    reason: 'Annual heart health check-up',
    notes: 'Patient shows good blood pressure control. Continue current medication regimen.'
  },
  {
    doctorId: doctorIds[1], // Dr. Michael Chen
    patientId: patientIds[1], // Maria Garcia
    date: new Date('2024-01-20T14:30:00'),
    status: 'CONFIRMED',
    type: 'VIDEO',
    reason: 'Diabetes management follow-up',
    notes: 'Review blood sugar logs and adjust medication if needed'
  },
  {
    doctorId: doctorIds[2], // Dr. Emily Rodriguez
    patientId: patientIds[2], // David Kim
    date: new Date('2024-01-25T09:00:00'),
    status: 'PENDING',
    type: 'TEXT',
    reason: 'Skin rash consultation',
    notes: 'Patient reports persistent eczema on hands'
  },
  {
    doctorId: doctorIds[0], // Dr. Sarah Johnson
    patientId: patientIds[3], // Sarah Thompson
    date: new Date('2024-02-01T11:00:00'),
    status: 'CONFIRMED',
    type: 'VIDEO',
    reason: 'Chest pain evaluation',
    notes: 'Schedule ECG and stress test'
  }
];

// Realistic review data
const getReviewData = (doctorIds, patientIds) => [
  {
    doctorId: doctorIds[0],
    patientId: patientIds[0],
    rating: 5,
    comment: 'Dr. Johnson is incredibly thorough and caring. She took time to explain my heart condition in detail.'
  },
  {
    doctorId: doctorIds[1],
    patientId: patientIds[1],
    rating: 4,
    comment: 'Dr. Chen is very knowledgeable about diabetes management. Would appreciate slightly longer appointment times.'
  },
  {
    doctorId: doctorIds[2],
    patientId: patientIds[2],
    rating: 5,
    comment: 'Excellent dermatologist! Resolved my skin issues quickly with effective treatment.'
  }
];

// Realistic medical records
const getMedicalRecordData = (patientIds) => [
  {
    patientId: patientIds[0],
    title: 'Annual Physical Exam',
    description: 'Comprehensive physical examination with blood work. All results within normal limits.'
  },
  {
    patientId: patientIds[1],
    title: 'HbA1c Test Results',
    description: 'Latest HbA1c shows 7.2% - good diabetes control. Continue current treatment plan.'
  },
  {
    patientId: patientIds[2],
    description: 'Prescription refill for albuterol inhaler. Patient reports good asthma control.'
  }
];

// Realistic messages
const getMessageData = (userIds) => [
  {
    senderId: userIds[0], // James Wilson
    receiverId: userIds[3], // Dr. Sarah Johnson
    content: 'Hi Dr. Johnson, I\'ve been experiencing some mild chest discomfort during my morning runs. Should I be concerned?',
    type: 'TEXT'
  },
  {
    senderId: userIds[3], // Dr. Sarah Johnson
    receiverId: userIds[0], // James Wilson
    content: 'Hi James, thanks for reaching out. Given your history, let\'s schedule an ECG to rule out any cardiac issues. I\'ll send you an appointment link.',
    type: 'TEXT'
  },
  {
    senderId: userIds[1], // Maria Garcia
    receiverId: userIds[4], // Dr. Michael Chen
    content: 'Dr. Chen, my blood sugar readings have been higher than usual this week. Could we adjust my medication?',
    type: 'TEXT'
  }
];

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await prisma.message.deleteMany();
    await prisma.notification.deleteMany();
    await prisma.file.deleteMany();
    await prisma.review.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.medicalRecord.deleteMany();
    await prisma.doctorProfile.deleteMany();
    await prisma.patientProfile.deleteMany();
    await prisma.user.deleteMany();

    // Create doctors
    console.log('👨‍⚕️ Creating doctors...');
    const createdDoctors = [];
    for (const doctor of doctors) {
      const hashedPassword = await hashPassword(doctor.password);
      const user = await prisma.user.create({
        data: {
          email: doctor.email,
          password: hashedPassword,
          role: doctor.role,
          doctorProfile: {
            create: doctor.doctorProfile
          }
        }
      });
      createdDoctors.push(user);
    }

    // Create patients
    console.log('👥 Creating patients...');
    const createdPatients = [];
    for (const patient of patients) {
      const hashedPassword = await hashPassword(patient.password);
      const user = await prisma.user.create({
        data: {
          email: patient.email,
          password: hashedPassword,
          role: patient.role,
          patientProfile: {
            create: patient.patientProfile
          }
        }
      });
      createdPatients.push(user);
    }

    // Get doctor and patient IDs
    const doctorIds = createdDoctors.map(d => d.id);
    const patientIds = createdPatients.map(p => p.id);

    // Create appointments
    console.log('📅 Creating appointments...');
    const appointments = getAppointmentData(doctorIds, patientIds);
    for (const appointment of appointments) {
      await prisma.appointment.create({ data: appointment });
    }

    // Create reviews
    console.log('⭐ Creating reviews...');
    const reviews = getReviewData(doctorIds, patientIds);
    for (const review of reviews) {
      await prisma.review.create({ data: review });
    }

    // Create medical records
    console.log('📋 Creating medical records...');
    const medicalRecords = getMedicalRecordData(patientIds);
    for (const record of medicalRecords) {
      await prisma.medicalRecord.create({ data: record });
    }

    // Create messages
    console.log('💬 Creating messages...');
    const allUserIds = [...doctorIds, ...patientIds];
    const messages = getMessageData(allUserIds);
    for (const message of messages) {
      await prisma.message.create({ data: message });
    }

    // Update doctor average reviews
    console.log('📊 Updating doctor ratings...');
    for (const doctorId of doctorIds) {
      const reviews = await prisma.review.findMany({
        where: { doctorId }
      });
      const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
      
      await prisma.doctorProfile.update({
        where: { userId: doctorId },
        data: { avgReview: avgRating || 0 }
      });
    }

    console.log('✅ Database seeding completed successfully!');
    console.log(`Created ${createdDoctors.length} doctors`);
    console.log(`Created ${createdPatients.length} patients`);
    console.log(`Created ${appointments.length} appointments`);
    console.log(`Created ${reviews.length} reviews`);
    console.log(`Created ${medicalRecords.length} medical records`);
    console.log(`Created ${messages.length} messages`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Execute seeding
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

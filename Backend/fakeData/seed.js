import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { fileUrls } from './fileUrls.js';
const prisma = new PrismaClient();

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

function generateDoctorProfile() {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    professionalBio: faker.lorem.paragraph(),
    specialization: faker.helpers.arrayElement([
      'Cardiology', 'Family Medicine', 'Dermatology', 'Neurology', 'Pediatrics',
      'Oncology', 'Psychiatry', 'Orthopedics'
    ]),
    yearsExperience: faker.number.int({ min: 5, max: 30 }),
    medicalLicense: `MD-${faker.location.state().slice(0, 2)}-${faker.number.int({ min: 10000, max: 99999 })}`,
    officeAddress: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    zipCode: faker.location.zipCode('#####'),
    phoneNumber: faker.phone.number('+1 (###) ###-####'),
    emergencyContact: faker.phone.number('+1 (###) ###-####'),
    availability: {
      monday: ['09:00-13:00', '14:00-17:00'],
      tuesday: ['09:00-13:00', '14:00-17:00'],
      wednesday: ['09:00-13:00', '14:00-17:00'],
      thursday: ['09:00-13:00', '14:00-17:00'],
      friday: ['09:00-13:00', '14:00-16:00']
    }
  };
}

function generatePatientProfile() {
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    phoneNumber: faker.phone.number('+1 (###) ###-####'),
    dateOfBirth: faker.date.past({ years: 50, refDate: '2005-01-01' }),
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    zipCode: faker.location.zipCode('#####'),
    medicalHistory: faker.lorem.paragraph(),
  };
}

function generateFile(ownerId, type) {
  let url;
  switch (type) {
    case 'PROFILE_PICTURE':
      url = faker.helpers.arrayElement(fileUrls.profilePictures);
      break;
    case 'CERTIFICATION':
      url = faker.helpers.arrayElement(fileUrls.doctorCertifications);
      break;
    case 'MEDICAL_DOCUMENT':
      url = faker.helpers.arrayElement(fileUrls.medicalRecords);
      break;
    case 'CHAT_MEDIA':
      url = faker.helpers.arrayElement(fileUrls.messageAttachments);
      break;
    case 'CONSULTATION_RECORDING':
      url = faker.helpers.arrayElement(fileUrls.consultationRecordings);
      break;
    default:
      url = faker.image.url();
  }
  return {
    ownerId,
    url,
    fileType: type,
  };
}

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Clear existing data
    await prisma.notification.deleteMany();
    await prisma.doctorCertification.deleteMany();
    await prisma.review.deleteMany();
    await prisma.message.deleteMany();
    await prisma.videoCall.deleteMany();
    await prisma.appointment.deleteMany();
    await prisma.medicalRecord.deleteMany();
    await prisma.file.deleteMany();
    await prisma.doctorProfile.deleteMany();
    await prisma.patientProfile.deleteMany();
    await prisma.user.deleteMany();

    // Create known test doctor and patient with predictable emails
    const testDoctorPassword = await hashPassword('DoctorPass123!');
    const testPatientPassword = await hashPassword('PatientPass123!');

    const testDoctorUser = await prisma.user.create({
      data: {
        email: 'doctor.test@healthyconnect.com',
        password: testDoctorPassword,
        role: 'DOCTOR',
        doctorProfile: { create: generateDoctorProfile() }
      },
      include: { doctorProfile: true }
    });

    const testPatientUser = await prisma.user.create({
      data: {
        email: 'patient.test@mail.com',
        password: testPatientPassword,
        role: 'PATIENT',
        patientProfile: { create: generatePatientProfile() }
      },
      include: { patientProfile: true }
    });

    // Create doctors
    const doctors = [];
    doctors.push(testDoctorUser);
    for (let i = 0; i < 5; i++) {
      const password = await hashPassword('DoctorPass123!');
      const doctorData = generateDoctorProfile();
      
      const user = await prisma.user.create({
        data: {
          email: faker.internet.email({ firstName: doctorData.firstName, lastName: doctorData.lastName, provider: 'healthyconnect.com' }),
          password,
          role: 'DOCTOR',
          doctorProfile: {
            create: doctorData
          }
        },
        include: {
          doctorProfile: true
        }
      });
      doctors.push(user);
    }

    // Create patients
    const patients = [];
    patients.push(testPatientUser);
    for (let i = 0; i < 10; i++) {
      const password = await hashPassword('PatientPass123!');
      const patientData = generatePatientProfile();
      
      const user = await prisma.user.create({
        data: {
          email: faker.internet.email({ firstName: patientData.firstName, lastName: patientData.lastName }),
          password,
          role: 'PATIENT',
          patientProfile: {
            create: patientData
          }
        },
        include: {
          patientProfile: true
        }
      });
      patients.push(user);
    }

    // Create files for profiles and certifications
    for (const doctor of doctors) {
      // Profile picture
      const profilePic = await prisma.file.create({
        data: generateFile(doctor.id, 'PROFILE_PICTURE')
      });
      await prisma.doctorProfile.update({
        where: { id: doctor.doctorProfile.id },
        data: { photoId: profilePic.id }
      });

      // Certifications (2-4 per doctor)
      const certCount = faker.number.int({ min: 2, max: 4 });
      for (let i = 0; i < certCount; i++) {
        const certFile = await prisma.file.create({
          data: generateFile(doctor.id, 'CERTIFICATION')
        });
        await prisma.doctorCertification.create({
          data: {
            doctorProfileId: doctor.doctorProfile.id,
            fileId: certFile.id
          }
        });
      }
    }

    for (const patient of patients) {
      const file = await prisma.file.create({
        data: generateFile(patient.id, 'PROFILE_PICTURE')
      });
      await prisma.patientProfile.update({
        where: { id: patient.patientProfile.id },
        data: { photoId: file.id }
      });
    }

    // Create appointments
    for (let i = 0; i < 20; i++) {
      const doctor = faker.helpers.arrayElement(doctors);
      const patient = faker.helpers.arrayElement(patients);
      
      const appointmentStatus = faker.helpers.arrayElement(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']);
      const appointmentData = {
        doctorId: doctor.doctorProfile.id,
        patientId: patient.patientProfile.id,
        date: faker.date.future(),
        status: appointmentStatus,
        type: faker.helpers.arrayElement(['TEXT', 'VIDEO']),
        reason: faker.lorem.sentence(),
        notes: faker.lorem.paragraph(),
      };

      // Add recording for completed video appointments (50% chance)
      if (appointmentStatus === 'COMPLETED' && appointmentData.type === 'VIDEO' && faker.datatype.boolean()) {
        const recording = await prisma.file.create({
          data: generateFile(doctor.id, 'CONSULTATION_RECORDING')
        });
        appointmentData.recordingId = recording.id;
      }

      await prisma.appointment.create({
        data: appointmentData
      });
    }

    // Create reviews
    for (let i = 0; i < 15; i++) {
      const doctor = faker.helpers.arrayElement(doctors);
      const patient = faker.helpers.arrayElement(patients);
      
      await prisma.review.create({
        data: {
          doctorId: doctor.doctorProfile.id,
          patientId: patient.patientProfile.id,
          rating: faker.number.int({ min: 1, max: 5 }),
          comment: faker.lorem.paragraph(),
        }
      });
    }

    // Create medical records
    for (const patient of patients) {
      const file = await prisma.file.create({
        data: generateFile(patient.id, 'MEDICAL_DOCUMENT')
      });
      
      await prisma.medicalRecord.create({
        data: {
          patientId: patient.patientProfile.id,
          title: faker.lorem.words(3),
          description: faker.lorem.paragraph(),
          fileId: file.id,
        }
      });
    }

    // Create messages
    for (let i = 0; i < 30; i++) {
      const sender = faker.helpers.arrayElement([...doctors, ...patients]);
      let receiver;
      do {
        receiver = faker.helpers.arrayElement([...doctors, ...patients]);
      } while (receiver.id === sender.id);

      const messageType = faker.helpers.arrayElement(['TEXT', 'IMAGE', 'FILE', 'VIDEO']);
      const messageData = {
        senderId: sender.id,
        receiverId: receiver.id,
        content: faker.lorem.paragraph(),
        type: messageType,
        isRead: faker.datatype.boolean(),
      };

      // Add file attachment for non-text messages
      if (messageType !== 'TEXT') {
        const file = await prisma.file.create({
          data: generateFile(sender.id, 'CHAT_MEDIA')
        });
        messageData.fileId = file.id;
      }

      await prisma.message.create({
        data: messageData
      });
    }

    // Create notifications
    for (const user of [...doctors, ...patients]) {
      await prisma.notification.create({
        data: {
          userId: user.id,
          type: faker.helpers.arrayElement(['APPOINTMENT', 'MESSAGE', 'REVIEW', 'SYSTEM']),
          content: faker.lorem.sentence(),
          isRead: faker.datatype.boolean(),
        }
      });
    }

    // Update doctor average reviews
    for (const doctor of doctors) {
      const reviews = await prisma.review.findMany({
        where: { doctorId: doctor.doctorProfile.id }
      });
      
      const avgRating = reviews.reduce((sum, review) => sum + review.rating, 0) / (reviews.length || 1);
      
      await prisma.doctorProfile.update({
        where: { id: doctor.doctorProfile.id },
        data: { avgReview: avgRating }
      });
    }

    console.log('✅ Database seeding completed successfully!');
    console.log(`Created ${doctors.length} doctors`);
    console.log(`Created ${patients.length} patients`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

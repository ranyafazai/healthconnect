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
  const specializations = [
    'Cardiology', 'Family Medicine', 'Dermatology', 'Neurology', 'Pediatrics',
    'Oncology', 'Psychiatry', 'Orthopedics', 'Endocrinology', 'Gastroenterology',
    'Ophthalmology', 'Urology', 'Gynecology', 'Pulmonology', 'Rheumatology'
  ];
  
  const specialization = faker.helpers.arrayElement(specializations);
  
  // Generate more realistic and varied availability
  const generateAvailability = () => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const availability = {};
    
    days.forEach(day => {
              if (faker.helpers.maybe(() => true, { probability: 0.8 })) { // 80% chance of being available
        const morningStart = faker.helpers.arrayElement(['08:00', '08:30', '09:00', '09:30']);
        const morningEnd = faker.helpers.arrayElement(['12:00', '12:30', '13:00']);
        const afternoonStart = faker.helpers.arrayElement(['13:30', '14:00', '14:30']);
        const afternoonEnd = faker.helpers.arrayElement(['17:00', '17:30', '18:00', '18:30']);
        
        availability[day] = [`${morningStart}-${morningEnd}`, `${afternoonStart}-${afternoonEnd}`];
      }
    });
    
    return availability;
  };

  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    professionalBio: faker.lorem.paragraphs(2, '\n\n'),
    specialization,
    yearsExperience: faker.number.int({ min: 3, max: 35 }),
    medicalLicense: `MD-${faker.location.state().slice(0, 2)}-${faker.number.int({ min: 10000, max: 99999 })}`,
    officeAddress: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    zipCode: faker.location.zipCode('#####'),
    phoneNumber: faker.phone.number('+1 (###) ###-####'),
    emergencyContact: faker.phone.number('+1 (###) ###-####'),
    availability: generateAvailability()
  };
}

function generatePatientProfile() {
  const age = faker.number.int({ min: 18, max: 85 });
  const birthDate = new Date();
  birthDate.setFullYear(birthDate.getFullYear() - age);
  
  return {
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    phoneNumber: faker.phone.number('+1 (###) ###-####'),
    dateOfBirth: birthDate,
    address: faker.location.streetAddress(),
    city: faker.location.city(),
    state: faker.location.state(),
    zipCode: faker.location.zipCode('#####'),
    medicalHistory: faker.lorem.paragraphs(1, '\n\n')
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
    for (let i = 0; i < 35; i++) {
      const doctor = faker.helpers.arrayElement(doctors);
      const patient = faker.helpers.arrayElement(patients);
      
      const appointmentStatus = faker.helpers.arrayElement(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']);
      const appointmentType = faker.helpers.arrayElement(['TEXT', 'VIDEO']);
      
      // Generate realistic appointment reasons based on specialization
      const specialization = doctor.doctorProfile.specialization;
      const reasonTemplates = {
        'Cardiology': [
          'Chest pain evaluation', 'Heart rhythm check', 'Blood pressure consultation',
          'Cardiac symptoms review', 'Heart health checkup', 'ECG interpretation'
        ],
        'Family Medicine': [
          'Annual physical exam', 'Cold and flu symptoms', 'Chronic disease management',
          'Preventive care visit', 'General health concerns', 'Medication review'
        ],
        'Dermatology': [
          'Skin rash evaluation', 'Mole examination', 'Acne treatment',
          'Skin cancer screening', 'Dermatological consultation', 'Skin condition review'
        ],
        'Neurology': [
          'Headache evaluation', 'Neurological symptoms', 'Memory concerns',
          'Nerve pain assessment', 'Neurological exam', 'Brain health consultation'
        ],
        'Pediatrics': [
          'Child wellness check', 'Vaccination', 'Growth and development',
          'Childhood illness', 'Behavioral concerns', 'Nutrition consultation'
        ]
      };
      
      const reasons = reasonTemplates[specialization] || [
        'General consultation', 'Health checkup', 'Symptom evaluation',
        'Follow-up visit', 'Preventive care', 'Treatment consultation'
      ];
      
      const appointmentData = {
        doctorId: doctor.doctorProfile.id,
        patientId: patient.patientProfile.id,
        date: faker.date.future({ years: 0.5 }),
        status: appointmentStatus,
        type: appointmentType,
        reason: faker.helpers.arrayElement(reasons),
        notes: faker.lorem.paragraph()
      };

      // Add recording for completed video appointments (30% chance)
              if (appointmentStatus === 'COMPLETED' && appointmentData.type === 'VIDEO' && faker.helpers.maybe(() => true, { probability: 0.3 })) {
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
    for (let i = 0; i < 25; i++) {
      const doctor = faker.helpers.arrayElement(doctors);
      const patient = faker.helpers.arrayElement(patients);
      
      const rating = faker.number.int({ min: 1, max: 5 });
      const reviewTemplates = {
        5: [
          "Excellent doctor! Very knowledgeable and caring. Highly recommend.",
          "Dr. {lastName} is amazing. Takes time to listen and explain everything clearly.",
          "Best doctor I've ever seen. Professional, thorough, and compassionate.",
          "Outstanding care and attention to detail. Couldn't ask for better treatment.",
          "Very professional and caring. Made me feel comfortable throughout the visit."
        ],
        4: [
          "Great doctor, very knowledgeable. Would definitely recommend.",
          "Good experience overall. Doctor was professional and helpful.",
          "Satisfied with the care received. Doctor was thorough and caring.",
          "Positive experience. Doctor was knowledgeable and took time to explain.",
          "Good doctor, professional service. Minor wait time but worth it."
        ],
        3: [
          "Decent doctor, but could be more thorough in explanations.",
          "Average experience. Doctor was okay but seemed rushed.",
          "Satisfactory care, though communication could be improved.",
          "Not bad, but not exceptional either. Met basic expectations.",
          "Okay doctor, but appointment felt a bit rushed."
        ],
        2: [
          "Disappointed with the visit. Doctor seemed disinterested.",
          "Not impressed. Felt rushed and didn't get answers to my questions.",
          "Below average experience. Doctor was not very helpful.",
          "Wouldn't recommend. Poor communication and rushed appointment.",
          "Mediocre care. Doctor seemed to be going through the motions."
        ],
        1: [
          "Terrible experience. Doctor was unprofessional and unhelpful.",
          "Worst doctor visit ever. Rude and dismissive.",
          "Avoid this doctor. Poor bedside manner and rushed care.",
          "Very disappointed. Doctor didn't listen to my concerns.",
          "Would never recommend. Unprofessional and uncaring."
        ]
      };
      
      const template = faker.helpers.arrayElement(reviewTemplates[rating]);
      const comment = template.replace('{lastName}', doctor.doctorProfile.lastName);
      
      await prisma.review.create({
        data: {
          doctorId: doctor.doctorProfile.id,
          patientId: patient.patientProfile.id,
          rating,
          comment,
        }
      });
    }

    // Create medical records
    for (const patient of patients) {
      // Create 1-3 medical records per patient
      const recordCount = faker.number.int({ min: 1, max: 3 });
      
      for (let i = 0; i < recordCount; i++) {
        const file = await prisma.file.create({
          data: generateFile(patient.id, 'MEDICAL_DOCUMENT')
        });
        
        const recordTypes = [
          'Lab Results', 'X-Ray Report', 'Blood Test', 'Prescription', 'Treatment Plan',
          'Surgery Report', 'Consultation Notes', 'Vaccination Record', 'Allergy Test', 'ECG Report'
        ];
        
        await prisma.medicalRecord.create({
          data: {
            patientId: patient.patientProfile.id,
            title: faker.helpers.arrayElement(recordTypes),
            description: faker.lorem.paragraph(),
            fileId: file.id
          }
        });
      }
    }

    // Create messages
    for (let i = 0; i < 50; i++) {
      const sender = faker.helpers.arrayElement([...doctors, ...patients]);
      let receiver;
      do {
        receiver = faker.helpers.arrayElement([...doctors, ...patients]);
      } while (receiver.id === sender.id);

      const messageType = faker.helpers.arrayElement(['TEXT', 'IMAGE', 'FILE', 'VIDEO']);
      
      // Generate realistic message content based on sender type
      let content;
      if (sender.role === 'DOCTOR') {
        const doctorMessages = [
          "Hello! How are you feeling today?",
          "I've reviewed your test results. Everything looks good.",
          "Please remember to take your medication as prescribed.",
          "Your appointment is confirmed for tomorrow at 2 PM.",
          "Feel free to reach out if you have any questions.",
          "I've sent you a prescription refill.",
          "Your lab results are ready. Let's discuss them.",
          "How did the treatment work for you?",
          "I'm here if you need anything urgent.",
          "Let's schedule a follow-up appointment."
        ];
        content = faker.helpers.arrayElement(doctorMessages);
      } else {
        const patientMessages = [
          "Hi doctor, I have a question about my medication.",
          "I'm experiencing some side effects.",
          "Can I schedule an appointment for next week?",
          "Thank you for the treatment, I'm feeling much better.",
          "I forgot to ask about the dosage during my visit.",
          "Is it normal to feel this way?",
          "I need a prescription refill.",
          "Can you explain the test results?",
          "I have some concerns about my symptoms.",
          "When should I come back for a checkup?"
        ];
        content = faker.helpers.arrayElement(patientMessages);
      }
      
      const messageData = {
        senderId: sender.id,
        receiverId: receiver.id,
        content,
        type: messageType,
        isRead: faker.helpers.maybe(() => true, { probability: 0.5 }),
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
      // Create 2-5 notifications per user
      const notificationCount = faker.number.int({ min: 2, max: 5 });
      
      for (let i = 0; i < notificationCount; i++) {
        const notificationType = faker.helpers.arrayElement(['APPOINTMENT', 'MESSAGE', 'REVIEW', 'SYSTEM']);
        
        let content;
        switch (notificationType) {
          case 'APPOINTMENT':
            content = faker.helpers.arrayElement([
              'Your appointment has been confirmed for tomorrow',
              'New appointment request received',
              'Appointment reminder: You have a visit in 2 hours',
              'Your appointment has been rescheduled',
              'Appointment cancellation confirmed'
            ]);
            break;
          case 'MESSAGE':
            content = faker.helpers.arrayElement([
              'You have a new message from Dr. Smith',
              'New message received from patient',
              'Unread message in your inbox',
              'Message notification: Urgent inquiry'
            ]);
            break;
          case 'REVIEW':
            content = faker.helpers.arrayElement([
              'New review received from patient',
              'Your review has been published',
              'Review notification: Patient feedback'
            ]);
            break;
          case 'SYSTEM':
            content = faker.helpers.arrayElement([
              'Welcome to HealthyConnect!',
              'System maintenance scheduled for tonight',
              'New features available in your dashboard',
              'Profile update required'
            ]);
            break;
        }
        
        await prisma.notification.create({
          data: {
            userId: user.id,
            type: notificationType,
            content,
            isRead: faker.helpers.maybe(() => true, { probability: 0.3 }),
          }
        });
      }
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
    console.log(`\n📊 Summary of created data:`);
    console.log(`👨‍⚕️  Doctors: ${doctors.length}`);
    console.log(`👥 Patients: ${patients.length}`);
    console.log(`📅 Appointments: 35`);
    console.log(`⭐ Reviews: 25`);
    console.log(`📋 Medical Records: ${patients.length * 2} (average)`);
    console.log(`💬 Messages: 50`);
    console.log(`🔔 Notifications: ${(doctors.length + patients.length) * 3} (average)`);
    console.log(`📁 Files: ${doctors.length * 3 + patients.length * 2} (average)`);
    
    console.log(`\n🔑 Test Accounts:`);
    console.log(`   Doctor: doctor.test@healthyconnect.com / DoctorPass123!`);
    console.log(`   Patient: patient.test@mail.com / PatientPass123!`);
    
    console.log(`\n💡 The database now contains realistic test data for testing all features!`);

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

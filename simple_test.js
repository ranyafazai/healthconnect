// Simple test to isolate real-time messaging issue
const io = require('socket.io-client');

const BASE_URL = 'http://localhost:5000';
const DOCTOR_USER_ID = 1;
const PATIENT_USER_ID = 2;
const APPOINTMENT_ID = 1;

console.log('🧪 Simple real-time messaging test...\n');

// Test 1: Patient connects and listens
console.log('1️⃣ Patient connecting...');
const patientSocket = io(`${BASE_URL}/chat`);

patientSocket.on('connect', () => {
  console.log('✅ Patient connected, socket ID:', patientSocket.id);
  
  // Join user room
  console.log('🔌 Patient joining user room...');
  patientSocket.emit('join-user', PATIENT_USER_ID);
});

patientSocket.on('joined', (data) => {
  console.log('✅ Patient joined user room:', data);
  
  // Join appointment room AFTER joining user room
  console.log('🔌 Patient joining appointment room...');
  patientSocket.emit('join-appointment', APPOINTMENT_ID);
});

patientSocket.on('appointment-joined', (data) => {
  console.log('✅ Patient joined appointment room:', data);
});

// Listen for new messages
patientSocket.on('new-message', (message) => {
  console.log('📨 Patient received new message:', message.content);
  console.log('📝 Full message:', message);
});

// Listen for appointment messages
patientSocket.on('appointment-message', (message) => {
  console.log('📨 Patient received appointment message:', message.content);
  console.log('📝 Full appointment message:', message);
});

// Test 2: Doctor connects and sends message
setTimeout(() => {
  console.log('\n2️⃣ Doctor connecting...');
  const doctorSocket = io(`${BASE_URL}/chat`);
  
  doctorSocket.on('connect', () => {
    console.log('✅ Doctor connected, socket ID:', doctorSocket.id);
    
    // Join user room
    console.log('🔌 Doctor joining user room...');
    doctorSocket.emit('join-user', DOCTOR_USER_ID);
  });
  
  doctorSocket.on('joined', (data) => {
    console.log('✅ Doctor joined user room:', data);
    
    // Join appointment room
    console.log('🔌 Doctor joining appointment room...');
    doctorSocket.emit('join-appointment', APPOINTMENT_ID);
  });
  
  doctorSocket.on('appointment-joined', (data) => {
    console.log('✅ Doctor joined appointment room:', data);
    
    // Send message after 2 seconds
    setTimeout(() => {
      console.log('\n3️⃣ Doctor sending message...');
      doctorSocket.emit('send-message', {
        receiverId: PATIENT_USER_ID,
        appointmentId: APPOINTMENT_ID,
        content: 'Hello patient! This is a test message.',
        type: 'TEXT'
      });
    }, 2000);
  });
  
  doctorSocket.on('message-sent', (message) => {
    console.log('✅ Doctor message sent confirmation:', message.content);
  });
  
  doctorSocket.on('error', (error) => {
    console.error('❌ Doctor socket error:', error);
  });
  
}, 3000);

// Error handling
patientSocket.on('error', (error) => {
  console.error('❌ Patient socket error:', error);
});

patientSocket.on('disconnect', () => {
  console.log('🔌 Patient disconnected');
});

// Cleanup
setTimeout(() => {
  console.log('\n🧹 Test completed');
  process.exit(0);
}, 10000);

console.log('💡 Watch for:');
console.log('1. Both users connecting successfully');
console.log('2. Both users joining rooms successfully');
console.log('3. Patient receiving the message via socket');
console.log('4. Any error messages in the console');

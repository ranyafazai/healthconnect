// Test to compare doctor vs patient message reception
const io = require('socket.io-client');

const BASE_URL = 'http://localhost:5000';
const DOCTOR_USER_ID = 1;
const PATIENT_USER_ID = 2;
const APPOINTMENT_ID = 1;

console.log('🔍 Testing doctor vs patient message reception...\n');

// Test 1: Both users connect and join rooms
console.log('1️⃣ Both users connecting...');
const doctorSocket = io(`${BASE_URL}/chat`);
const patientSocket = io(`${BASE_URL}/chat`);

// Doctor setup
doctorSocket.on('connect', () => {
  console.log('✅ Doctor connected, socket ID:', doctorSocket.id);
  console.log('🔌 Doctor joining user room...');
  doctorSocket.emit('join-user', DOCTOR_USER_ID);
});

doctorSocket.on('joined', (data) => {
  console.log('✅ Doctor joined user room:', data);
  console.log('🔌 Doctor joining appointment room...');
  doctorSocket.emit('join-appointment', APPOINTMENT_ID);
});

doctorSocket.on('appointment-joined', (data) => {
  console.log('✅ Doctor joined appointment room:', data);
});

// Patient setup
patientSocket.on('connect', () => {
  console.log('✅ Patient connected, socket ID:', patientSocket.id);
  console.log('🔌 Patient joining user room...');
  patientSocket.emit('join-user', PATIENT_USER_ID);
});

patientSocket.on('joined', (data) => {
  console.log('✅ Patient joined user room:', data);
  console.log('🔌 Patient joining appointment room...');
  patientSocket.emit('join-appointment', APPOINTMENT_ID);
});

patientSocket.on('appointment-joined', (data) => {
  console.log('✅ Patient joined appointment room:', data);
});

// Message reception test
doctorSocket.on('new-message', (message) => {
  console.log('📨 Doctor received message:', message.content);
  console.log('📝 Doctor message details:', {
    id: message.id,
    senderId: message.senderId,
    receiverId: message.receiverId,
    appointmentId: message.appointmentId
  });
});

patientSocket.on('new-message', (message) => {
  console.log('📨 Patient received message:', message.content);
  console.log('📝 Patient message details:', {
    id: message.id,
    senderId: message.senderId,
    receiverId: message.receiverId,
    appointmentId: message.appointmentId
  });
});

// Test 2: Send message from doctor to patient
setTimeout(() => {
  console.log('\n2️⃣ Doctor sending message to patient...');
  doctorSocket.emit('send-message', {
    receiverId: PATIENT_USER_ID,
    appointmentId: APPOINTMENT_ID,
    content: 'Hello patient! This is a test message from doctor.',
    type: 'TEXT'
  });
}, 3000);

// Test 3: Send message from patient to doctor
setTimeout(() => {
  console.log('\n3️⃣ Patient sending message to doctor...');
  patientSocket.emit('send-message', {
    receiverId: DOCTOR_USER_ID,
    appointmentId: APPOINTMENT_ID,
    content: 'Hello doctor! This is a test message from patient.',
    type: 'TEXT'
  });
}, 6000);

// Error handling
doctorSocket.on('error', (error) => {
  console.error('❌ Doctor socket error:', error);
});

patientSocket.on('error', (error) => {
  console.error('❌ Patient socket error:', error);
});

// Cleanup
setTimeout(() => {
  console.log('\n🧹 Test completed');
  process.exit(0);
}, 10000);

console.log('💡 Expected behavior:');
console.log('1. Both users connect and join rooms successfully');
console.log('2. Both users join appointment room successfully');
console.log('3. Doctor sends message → Patient receives via socket');
console.log('4. Patient sends message → Doctor receives via socket');
console.log('5. No page refresh needed for either user');

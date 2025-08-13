// Test complete real-time messaging flow
const io = require('socket.io-client');

const BASE_URL = 'http://localhost:5000';
const DOCTOR_USER_ID = 1;
const PATIENT_USER_ID = 2;
const APPOINTMENT_ID = 1;

console.log('🧪 Testing complete real-time messaging flow...\n');

// Test 1: Patient connects and joins rooms
console.log('1️⃣ Patient connecting...');
const patientSocket = io(`${BASE_URL}/chat`);

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

// Listen for new messages
patientSocket.on('new-message', (message) => {
  console.log('📨 Patient received new message via socket:', message.content);
  console.log('📝 Message details:', {
    id: message.id,
    senderId: message.senderId,
    receiverId: message.receiverId,
    appointmentId: message.appointmentId
  });
});

// Test 2: Doctor connects and joins rooms
setTimeout(() => {
  console.log('\n2️⃣ Doctor connecting...');
  const doctorSocket = io(`${BASE_URL}/chat`);
  
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
    
    // Send message after 2 seconds
    setTimeout(() => {
      console.log('\n3️⃣ Doctor sending message...');
      doctorSocket.emit('send-message', {
        receiverId: PATIENT_USER_ID,
        appointmentId: APPOINTMENT_ID,
        content: 'Hello patient! This is a test message from doctor.',
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

// Test 3: Patient sends message back
setTimeout(() => {
  console.log('\n4️⃣ Patient sending message back...');
  patientSocket.emit('send-message', {
    receiverId: DOCTOR_USER_ID,
    appointmentId: APPOINTMENT_ID,
    content: 'Hello doctor! This is a test message from patient.',
    type: 'TEXT'
  });
}, 8000);

patientSocket.on('message-sent', (message) => {
  console.log('✅ Patient message sent confirmation:', message.content);
});

// Error handling
patientSocket.on('error', (error) => {
  console.error('❌ Patient socket error:', error);
});

// Cleanup
setTimeout(() => {
  console.log('\n🧹 Test completed');
  process.exit(0);
}, 12000);

console.log('💡 Expected flow:');
console.log('1. Both users connect and join rooms successfully');
console.log('2. Doctor sends message → Patient receives via socket');
console.log('3. Patient sends message → Doctor receives via socket');
console.log('4. No HTTP API calls needed - pure socket communication');

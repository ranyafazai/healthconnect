// Check appointment data structure
const io = require('socket.io-client');

const BASE_URL = 'http://localhost:5000';
const PATIENT_USER_ID = 2;
const APPOINTMENT_ID = 1;

console.log('🔍 Checking appointment data structure...\n');

const patientSocket = io(`${BASE_URL}/chat`);

patientSocket.on('connect', () => {
  console.log('✅ Patient connected, socket ID:', patientSocket.id);
  console.log('🔌 Patient joining user room...');
  patientSocket.emit('join-user', PATIENT_USER_ID);
});

patientSocket.on('joined', (data) => {
  console.log('✅ Patient joined user room:', data);
  console.log('🔌 Now trying to join appointment room...');
  patientSocket.emit('join-appointment', APPOINTMENT_ID);
});

patientSocket.on('appointment-joined', (data) => {
  console.log('✅ Patient joined appointment room:', data);
});

patientSocket.on('error', (error) => {
  console.error('❌ Patient socket error:', error);
});

// Cleanup after 5 seconds
setTimeout(() => {
  console.log('\n🧹 Test completed');
  process.exit(0);
}, 5000);

// Test video call functionality
const io = require('socket.io-client');

const BASE_URL = 'http://localhost:5000';
const DOCTOR_USER_ID = 1;
const PATIENT_USER_ID = 2;
const APPOINTMENT_ID = 1;

console.log('🎥 Testing video call functionality...\n');

// Test 1: Doctor initiates video call
console.log('1️⃣ Doctor connecting to video call...');
const doctorSocket = io(`${BASE_URL}/video-call`);

doctorSocket.on('connect', () => {
  console.log('✅ Doctor video call socket connected, ID:', doctorSocket.id);
  console.log('🔌 Doctor joining user room...');
  doctorSocket.emit('join-user', DOCTOR_USER_ID);
});

doctorSocket.on('joined', (data) => {
  console.log('✅ Doctor joined video call user room:', data);
  console.log('🔌 Doctor joining call room...');
  doctorSocket.emit('join-call', { 
    appointmentId: APPOINTMENT_ID, 
    roomId: `test-room-${Date.now()}` 
  });
});

doctorSocket.on('call-joined', (data) => {
  console.log('✅ Doctor joined call room:', data);
  console.log('🔌 Call details:', {
    roomId: data.roomId,
    appointmentId: data.appointmentId,
    videoCallId: data.videoCallId
  });
});

doctorSocket.on('user-joined-call', (data) => {
  console.log('✅ Another user joined the call:', data);
});

// Test 2: Patient joins video call
setTimeout(() => {
  console.log('\n2️⃣ Patient connecting to video call...');
  const patientSocket = io(`${BASE_URL}/video-call`);
  
  patientSocket.on('connect', () => {
    console.log('✅ Patient video call socket connected, ID:', patientSocket.id);
    console.log('🔌 Patient joining user room...');
    patientSocket.emit('join-user', PATIENT_USER_ID);
  });
  
  patientSocket.on('joined', (data) => {
    console.log('✅ Patient joined video call user room:', data);
    console.log('🔌 Patient joining call room...');
    patientSocket.emit('join-call', { 
      appointmentId: APPOINTMENT_ID 
    });
  });
  
  patientSocket.on('call-joined', (data) => {
    console.log('✅ Patient joined call room:', data);
    console.log('🔌 Call details:', {
      roomId: data.roomId,
      appointmentId: data.appointmentId,
      videoCallId: data.videoCallId
    });
  });
  
  patientSocket.on('user-joined-call', (data) => {
    console.log('✅ Another user joined the call:', data);
  });
  
  patientSocket.on('error', (error) => {
    console.error('❌ Patient video call error:', error);
  });
  
}, 2000);

// Test 3: WebRTC signaling test
setTimeout(() => {
  console.log('\n3️⃣ Testing WebRTC signaling...');
  
  // Simulate offer from doctor
  console.log('📤 Doctor sending offer...');
  doctorSocket.emit('offer', {
    targetUserId: PATIENT_USER_ID,
    offer: {
      type: 'offer',
      sdp: 'test-sdp-offer'
    }
  });
  
}, 5000);

setTimeout(() => {
  console.log('\n4️⃣ Testing call controls...');
  
  // Test mute audio
  console.log('🔇 Doctor muting audio...');
  doctorSocket.emit('mute-audio', true);
  
  // Test mute video
  console.log('📹 Doctor muting video...');
  doctorSocket.emit('mute-video', true);
  
}, 7000);

// Test 4: End call
setTimeout(() => {
  console.log('\n5️⃣ Ending call...');
  
  // Test call recording
  console.log('📹 Doctor starting recording...');
  doctorSocket.emit('start-recording');
  
  // End call after 2 seconds
  setTimeout(() => {
    console.log('📞 Doctor ending call...');
    doctorSocket.emit('end-call');
  }, 2000);
  
}, 9000);

// Event handlers for doctor
doctorSocket.on('offer', (data) => {
  console.log('📥 Doctor received offer:', data);
});

doctorSocket.on('answer', (data) => {
  console.log('📥 Doctor received answer:', data);
});

doctorSocket.on('ice-candidate', (data) => {
  console.log('📥 Doctor received ICE candidate:', data);
});

doctorSocket.on('user-muted-audio', (data) => {
  console.log('🔇 User muted audio:', data);
});

doctorSocket.on('user-muted-video', (data) => {
  console.log('📹 User muted video:', data);
});

doctorSocket.on('recording-started', (data) => {
  console.log('📹 Recording started:', data);
});

doctorSocket.on('call-ended', (data) => {
  console.log('📞 Call ended:', data);
});

doctorSocket.on('error', (error) => {
  console.error('❌ Doctor video call error:', error);
});

// Cleanup
setTimeout(() => {
  console.log('\n🧹 Video call test completed');
  process.exit(0);
}, 15000);

console.log('💡 Expected flow:');
console.log('1. Both users connect to video call socket');
console.log('2. Both users join call room successfully');
console.log('3. WebRTC signaling works (offer/answer/ICE)');
console.log('4. Call controls work (mute, recording)');
console.log('5. Call ends gracefully');

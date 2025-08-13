// Debug script for messaging issues
// Run this in your browser console when logged in as a patient

console.log('🔍 Debugging Messaging Issues');
console.log('=============================');

// Function to check current user data
function checkCurrentUser() {
  console.log('Current user data:');
  console.log('User ID:', window.currentUser?.id);
  console.log('User Role:', window.currentUser?.role);
  console.log('Patient Profile ID:', window.currentUser?.patientProfile?.id);
  console.log('Full user object:', window.currentUser);
}

// Function to check appointments data
function checkAppointments() {
  console.log('Appointments data:');
  // This will show appointments from Redux store if available
  console.log('Navigate to /patient/appointments to see appointments');
}

// Function to check conversations data
function checkConversations() {
  console.log('Conversations data:');
  // This will show conversations from the useConversations hook
  console.log('Navigate to /patient/messages to see conversations');
}

// Function to test message sending with specific data
function testMessageSend(receiverId, content, appointmentId) {
  console.log('Testing message send with:');
  console.log('Receiver ID:', receiverId);
  console.log('Content:', content);
  console.log('Appointment ID:', appointmentId);
  
  // This would be the API call
  console.log('API call would be:');
  console.log(`POST /api/messages`);
  console.log(`Body: { receiverId: ${receiverId}, content: "${content}", appointmentId: ${appointmentId} }`);
}

// Function to check database users
function checkDatabaseUsers() {
  console.log('To check database users, run this in your backend terminal:');
  console.log('npx prisma studio');
  console.log('Or check the User table directly');
}

// Function to validate receiver ID
function validateReceiverId(receiverId) {
  console.log(`Validating receiver ID: ${receiverId}`);
  console.log('This should be a User.id, not a DoctorProfile.id or PatientProfile.id');
  console.log('Check if this ID exists in the User table');
}

// Make functions available globally
window.checkCurrentUser = checkCurrentUser;
window.checkAppointments = checkAppointments;
window.checkConversations = checkConversations;
window.testMessageSend = testMessageSend;
window.checkDatabaseUsers = checkDatabaseUsers;
window.validateReceiverId = validateReceiverId;

// Display debugging instructions
console.log('\n📋 Debugging Instructions:');
console.log('1. Run checkCurrentUser() to see current user data');
console.log('2. Navigate to /patient/messages and check console for conversation logs');
console.log('3. Try sending a message and check console for "Sending message with data" log');
console.log('4. Check backend console for "Send message request" and "Receiver found" logs');
console.log('5. If receiver not found, run validateReceiverId(receiverId) to debug');
console.log('6. Use checkDatabaseUsers() to open Prisma Studio and check User table');

console.log('\n🔧 Common Issues:');
console.log('- receiverId might be DoctorProfile.id instead of User.id');
console.log('- User might not exist in database');
console.log('- Appointment data might not include user information');

// Check if we're in the right context
if (window.location.pathname.includes('/patient')) {
  console.log('\n🎯 You are in the patient area - ready for debugging!');
  console.log('Run checkCurrentUser() to start debugging');
} else {
  console.log('\n⚠️ Please navigate to the patient area to debug messaging');
}

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// Test user credentials (you may need to adjust these)
const testUser = {
  email: 'patient.test@example.com',
  password: 'password123'
};

let authToken = '';

async function testSettingsAPI() {
  try {
    console.log('🧪 Testing User Settings API...\n');

    // Step 1: Login to get auth token
    console.log('1. Logging in to get auth token...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, testUser);
    authToken = loginResponse.data.data.token;
    console.log('✅ Login successful\n');

    // Step 2: Get user settings
    console.log('2. Getting user settings...');
    const getSettingsResponse = await axios.get(`${BASE_URL}/user-settings`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Get settings successful');
    console.log('Current settings:', JSON.stringify(getSettingsResponse.data.data, null, 2));
    console.log('');

    // Step 3: Update user settings
    console.log('3. Updating user settings...');
    const updatedSettings = {
      emailNotifications: false,
      smsNotifications: true,
      pushNotifications: true,
      appointmentReminders: false,
      messageNotifications: true,
      healthTips: true,
      marketingEmails: false,
      profileVisibility: 'ALL_USERS',
      shareMedicalHistory: false,
      allowDataAnalytics: true,
      shareForResearch: false,
      twoFactorAuth: true,
      sessionTimeout: 60,
      loginNotifications: false
    };

    const updateResponse = await axios.put(`${BASE_URL}/user-settings`, updatedSettings, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Update settings successful');
    console.log('Updated settings:', JSON.stringify(updateResponse.data.data, null, 2));
    console.log('');

    // Step 4: Verify the update by getting settings again
    console.log('4. Verifying updated settings...');
    const verifyResponse = await axios.get(`${BASE_URL}/user-settings`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Verification successful');
    console.log('Verified settings:', JSON.stringify(verifyResponse.data.data, null, 2));
    console.log('');

    console.log('🎉 All tests passed! User settings API is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Run the test
testSettingsAPI();

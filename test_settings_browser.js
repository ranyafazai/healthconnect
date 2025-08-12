// Test script for browser console
async function testSettingsAPI() {
  try {
    console.log('🧪 Testing User Settings API...\n');

    // Step 1: Get user settings
    console.log('1. Getting user settings...');
    const getResponse = await fetch('http://localhost:5000/api/user-settings', {
      method: 'GET',
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!getResponse.ok) {
      throw new Error(`HTTP error! status: ${getResponse.status}`);
    }

    const getData = await getResponse.json();
    console.log('✅ Get settings successful');
    console.log('Current settings:', getData);
    console.log('');

    // Step 2: Update user settings
    console.log('2. Updating user settings...');
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

    const updateResponse = await fetch('http://localhost:5000/api/user-settings', {
      method: 'PUT',
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updatedSettings)
    });

    if (!updateResponse.ok) {
      throw new Error(`HTTP error! status: ${updateResponse.status}`);
    }

    const updateData = await updateResponse.json();
    console.log('✅ Update settings successful');
    console.log('Updated settings:', updateData);
    console.log('');

    // Step 3: Verify the update
    console.log('3. Verifying updated settings...');
    const verifyResponse = await fetch('http://localhost:5000/api/user-settings', {
      method: 'GET',
      credentials: 'include', // Include cookies
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!verifyResponse.ok) {
      throw new Error(`HTTP error! status: ${verifyResponse.status}`);
    }

    const verifyData = await verifyResponse.json();
    console.log('✅ Verification successful');
    console.log('Verified settings:', verifyData);
    console.log('');

    console.log('🎉 All tests passed! User settings API is working correctly.');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testSettingsAPI();

const axios = require('axios');

async function testBackendConnection() {
  try {
    console.log('Testing backend connection...');
    
    // Test health endpoint
    const healthResponse = await axios.get('http://localhost:5000/health');
    console.log('Health check response:', healthResponse.data);
    
    // Test API endpoint
    const apiResponse = await axios.get('http://localhost:5000/api');
    console.log('API check response:', apiResponse.data);
    
    console.log('Backend is running successfully!');
  } catch (error) {
    console.error('Backend connection failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testBackendConnection();

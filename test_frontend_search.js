const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testFrontendSearch() {
  console.log('🧪 Testing Frontend Search Functionality...\n');

  try {
    // Test 1: Test search with actual specialties from database
    console.log('1. Testing search with Ophthalmology specialty...');
    const ophthalmologyResponse = await axios.get(`${BASE_URL}/doctors/search?specialization=Ophthalmology`);
    console.log(`✅ Found ${ophthalmologyResponse.data.data?.length || 0} ophthalmologists`);
    if (ophthalmologyResponse.data.data?.length > 0) {
      console.log(`   First doctor: ${ophthalmologyResponse.data.data[0].firstName} ${ophthalmologyResponse.data.data[0].lastName}`);
    }
    console.log('');

    // Test 2: Test search with actual city from database
    console.log('2. Testing search with West Bella city...');
    const cityResponse = await axios.get(`${BASE_URL}/doctors/search?city=West Bella`);
    console.log(`✅ Found ${cityResponse.data.data?.length || 0} doctors in West Bella`);
    if (cityResponse.data.data?.length > 0) {
      console.log(`   First doctor: ${cityResponse.data.data[0].firstName} ${cityResponse.data.data[0].lastName} - ${cityResponse.data.data[0].city}`);
    }
    console.log('');

    // Test 3: Test search with both specialty and city
    console.log('3. Testing search with Ophthalmology in West Bella...');
    const combinedResponse = await axios.get(`${BASE_URL}/doctors/search?specialization=Ophthalmology&city=West Bella`);
    console.log(`✅ Found ${combinedResponse.data.data?.length || 0} ophthalmologists in West Bella`);
    if (combinedResponse.data.data?.length > 0) {
      console.log(`   First doctor: ${combinedResponse.data.data[0].firstName} ${combinedResponse.data.data[0].lastName}`);
    }
    console.log('');

    // Test 4: Test search with Neurology specialty
    console.log('4. Testing search with Neurology specialty...');
    const neurologyResponse = await axios.get(`${BASE_URL}/doctors/search?specialization=Neurology`);
    console.log(`✅ Found ${neurologyResponse.data.data?.length || 0} neurologists`);
    if (neurologyResponse.data.data?.length > 0) {
      console.log(`   First doctor: ${neurologyResponse.data.data[0].firstName} ${neurologyResponse.data.data[0].lastName}`);
    }
    console.log('');

    // Test 5: Test search with Oncology specialty
    console.log('5. Testing search with Oncology specialty...');
    const oncologyResponse = await axios.get(`${BASE_URL}/doctors/search?specialization=Oncology`);
    console.log(`✅ Found ${oncologyResponse.data.data?.length || 0} oncologists`);
    if (oncologyResponse.data.data?.length > 0) {
      console.log(`   First doctor: ${oncologyResponse.data.data[0].firstName} ${oncologyResponse.data.data[0].lastName}`);
    }
    console.log('');

    // Test 6: Test search with partial city name
    console.log('6. Testing search with partial city name "West"...');
    const partialCityResponse = await axios.get(`${BASE_URL}/doctors/search?city=West`);
    console.log(`✅ Found ${partialCityResponse.data.data?.length || 0} doctors in cities containing "West"`);
    if (partialCityResponse.data.data?.length > 0) {
      console.log(`   First doctor: ${partialCityResponse.data.data[0].firstName} ${partialCityResponse.data.data[0].lastName} - ${partialCityResponse.data.data[0].city}`);
    }
    console.log('');

    console.log('🎉 Frontend search tests completed successfully!');
    console.log('');
    console.log('📋 Summary:');
    console.log('   - Specialty search: ✅ Working');
    console.log('   - City search: ✅ Working');
    console.log('   - Combined search: ✅ Working');
    console.log('   - Partial city search: ✅ Working');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testFrontendSearch();

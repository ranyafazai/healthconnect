const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function testDoctorSearch() {
  console.log('🧪 Testing Doctor Search Functionality...\n');

  try {
    // Test 1: Get all doctors first to see what's in the database
    console.log('1. Getting all doctors from database...');
    const allDoctorsResponse = await axios.get(`${BASE_URL}/doctors`);
    const allDoctors = allDoctorsResponse.data.data || [];
    console.log(`✅ Found ${allDoctors.length} total doctors`);
    
    if (allDoctors.length > 0) {
      console.log('Sample doctors:');
      allDoctors.slice(0, 3).forEach((doctor, index) => {
        console.log(`   ${index + 1}. Dr. ${doctor.firstName} ${doctor.lastName}`);
        console.log(`      Specialty: ${doctor.specialization}`);
        console.log(`      City: ${doctor.city || 'N/A'}`);
        console.log(`      Experience: ${doctor.yearsExperience} years`);
        console.log('');
      });
    }
    console.log('');

    // Test 2: Search by specialty
    console.log('2. Testing search by specialty (Cardiology)...');
    const specialtyResponse = await axios.get(`${BASE_URL}/doctors/search?specialization=Cardiology`);
    console.log(`✅ Found ${specialtyResponse.data.data?.length || 0} cardiologists`);
    if (specialtyResponse.data.data?.length > 0) {
      console.log(`   First doctor: ${specialtyResponse.data.data[0].firstName} ${specialtyResponse.data.data[0].lastName}`);
    }
    console.log('');

    // Test 3: Search by city
    console.log('3. Testing search by city...');
    const cityResponse = await axios.get(`${BASE_URL}/doctors/search?city=New York`);
    console.log(`✅ Found ${cityResponse.data.data?.length || 0} doctors in New York`);
    if (cityResponse.data.data?.length > 0) {
      console.log(`   First doctor: ${cityResponse.data.data[0].firstName} ${cityResponse.data.data[0].lastName} - ${cityResponse.data.data[0].city}`);
    }
    console.log('');

    // Test 4: Search by both specialty and city
    console.log('4. Testing search by specialty and city...');
    const combinedResponse = await axios.get(`${BASE_URL}/doctors/search?specialization=Dermatology&city=Los Angeles`);
    console.log(`✅ Found ${combinedResponse.data.data?.length || 0} dermatologists in Los Angeles`);
    if (combinedResponse.data.data?.length > 0) {
      console.log(`   First doctor: ${combinedResponse.data.data[0].firstName} ${combinedResponse.data.data[0].lastName} - ${combinedResponse.data.data[0].specialization}`);
    }
    console.log('');

    // Test 5: List available specialties
    console.log('5. Available specialties in the database:');
    const specialties = [...new Set(allDoctors.map(d => d.specialization))];
    specialties.forEach(specialty => {
      const count = allDoctors.filter(d => d.specialization === specialty).length;
      console.log(`   ${specialty}: ${count} doctors`);
    });
    console.log('');

    // Test 6: List available cities
    console.log('6. Available cities in the database:');
    const cities = [...new Set(allDoctors.map(d => d.city).filter(city => city))];
    cities.forEach(city => {
      const count = allDoctors.filter(d => d.city === city).length;
      console.log(`   ${city}: ${count} doctors`);
    });
    console.log('');

    // Test 7: Test search with actual data from database
    if (specialties.length > 0 && cities.length > 0) {
      const testSpecialty = specialties[0];
      const testCity = cities[0];
      console.log(`7. Testing search with actual data: ${testSpecialty} in ${testCity}...`);
      const actualDataResponse = await axios.get(`${BASE_URL}/doctors/search?specialization=${encodeURIComponent(testSpecialty)}&city=${encodeURIComponent(testCity)}`);
      console.log(`✅ Found ${actualDataResponse.data.data?.length || 0} doctors`);
      if (actualDataResponse.data.data?.length > 0) {
        console.log(`   First doctor: ${actualDataResponse.data.data[0].firstName} ${actualDataResponse.data.data[0].lastName}`);
      }
    }
    console.log('');

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testDoctorSearch();

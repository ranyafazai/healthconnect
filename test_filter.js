// Test for availability filtering - specifically "Available Next Week"
const testFilter = () => {
  const filters = {
    availability: 'Available Next Week'
  };
  
  const searchResults = [
    {
      firstName: 'Dr. John',
      lastName: 'Smith',
      availability: {
        monday: { slots: [{ start: '09:00', end: '17:00' }] },
        tuesday: { slots: [] },
        wednesday: { slots: [{ start: '10:00', end: '18:00' }] },
        thursday: { slots: [{ start: '09:00', end: '17:00' }] },
        friday: { slots: [{ start: '09:00', end: '17:00' }] },
        saturday: { slots: [] },
        sunday: { slots: [] }
      }
    },
    {
      firstName: 'Dr. Jane',
      lastName: 'Doe',
      availability: {
        monday: { slots: [] },
        tuesday: { slots: [{ start: '09:00', end: '17:00' }] },
        wednesday: { slots: [] },
        thursday: { slots: [] },
        friday: { slots: [] },
        saturday: { slots: [{ start: '09:00', end: '17:00' }] },
        sunday: { slots: [{ start: '09:00', end: '17:00' }] }
      }
    }
  ];

  // Mock current day as Monday (1) - August 12, 2024
  const currentDay = 1; // Monday
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const todayKey = days[currentDay]; // 'monday'
  
  console.log('Testing with current day:', todayKey);
  console.log('Filter:', filters.availability);
  
  const filtered = searchResults.filter(doctor => {
    if (!doctor.availability) return false;
    
    switch (filters.availability) {
      case 'Available Next Week':
        // Check if doctor has any availability in the next 7-14 days
        // Calculate actual dates for next week (7-13 days from now)
        for (let i = 7; i < 14; i++) {
          const futureDate = new Date();
          futureDate.setDate(futureDate.getDate() + i);
          const dayIndex = futureDate.getDay();
          const dayKey = days[dayIndex];
          if (doctor.availability[dayKey]?.slots?.length > 0) {
            return true;
          }
        }
        return false;
      default:
        return true;
    }
  });
  
  console.log('Results:', filtered.map(d => `${d.firstName} ${d.lastName}`));
  console.log('Count:', filtered.length);
  
  // Show what days are being checked for next week
  console.log('\nNext week days being checked:');
  for (let i = 7; i < 14; i++) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + i);
    const dayIndex = futureDate.getDay();
    const dayKey = days[dayIndex];
    console.log(`Day ${i}: ${dayKey} (${futureDate.toDateString()})`);
  }
};

// Run the test
testFilter();

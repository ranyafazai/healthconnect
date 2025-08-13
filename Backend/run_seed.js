#!/usr/bin/env node

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🌱 Running database seed to populate with more consultations...');

try {
  // Change to the Backend directory
  process.chdir(__dirname);
  
  // Run the seed command
  console.log('📊 Seeding database with 100 appointments (70% past consultations)...');
  execSync('npm run seed', { stdio: 'inherit' });
  
  console.log('✅ Database seeding completed successfully!');
  console.log('📱 You can now view more past consultations in the frontend.');
  console.log('💡 The backend will now return realistic consultation data with:');
  console.log('   - Symptoms, diagnosis, and prescriptions');
  console.log('   - Realistic costs based on specialization');
  console.log('   - Consultation durations and follow-up dates');
  console.log('   - Enhanced medical details for each consultation');
  
} catch (error) {
  console.error('❌ Error running seed:', error.message);
  process.exit(1);
}

#!/usr/bin/env node

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

try {
  // Change to the Backend directory
  process.chdir(__dirname);
  
  // Run the seed command
  execSync('npm run seed', { stdio: 'inherit' });
  
} catch (error) {
  console.error('Error running seed:', error.message);
  process.exit(1);
}

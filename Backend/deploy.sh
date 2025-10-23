#!/bin/bash

# Railway deployment script for HealthyConnect Backend

echo "🚀 Starting HealthyConnect Backend deployment..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --only=production

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# Start the application
echo "🌟 Starting HealthyConnect Backend..."
npm start

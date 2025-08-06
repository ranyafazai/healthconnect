import app from './app.js';
import { config } from './config/env';
import prisma from './config/database';
import { log } from 'console';

console.log('conffff', config);

const PORT = config.port;

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n👋 Received ${signal}. Shutting down gracefully...`);
  prisma.$disconnect()
    .then(() => {
      console.log('🛑 Database disconnected');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Error during disconnect:', err);
      process.exit(1);
    });
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

startServer();

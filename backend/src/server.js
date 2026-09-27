const app = require('./app');
const config = require('./config');
const prisma = require('./database/prisma');

const PORT = config.port;

const server = app.listen(PORT, async () => {
  try {
    // Verify database connection
    await prisma.$connect();
    console.log(`===================================================`);
    console.log(`🚀 ShopNexus Backend API is running on port ${PORT}`);
    console.log(`🌐 Environment: ${config.nodeEnv}`);
    console.log(`📦 Database: Connected successfully via Prisma`);
    console.log(`📡 Health: http://localhost:${PORT}/api/health`);
    console.log(`===================================================`);
  } catch (error) {
    console.error('❌ Failed to connect to database on startup:', error);
  }
});

// Graceful shutdown handling
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Process terminated.');
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('Process terminated.');
  });
});

const { PrismaClient } = require('@prisma/client');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

prisma.$on('error', (e) => {
  logger.error(e.message);
});

prisma.$on('warn', (e) => {
  logger.warn(e.message);
});

const connectDB = async () => {
  try {
    await prisma.$connect();
    logger.info('Connected to PostgreSQL via Prisma');
  } catch (error) {
    logger.error('PostgreSQL connection error', error);
    logger.warn('Continuing without database connection for now...');
  }
};

const disconnectDB = async () => {
  await prisma.$disconnect();
  logger.info('Disconnected from PostgreSQL');
};

module.exports = {
  prisma,
  connectDB,
  disconnectDB
};

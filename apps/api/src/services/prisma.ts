import { PrismaClient } from '@prisma/client';
import { env } from '../config/env';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `mysql://${env.DB_USER}:${encodeURIComponent(env.DB_PASS)}@${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`,
    },
  },
  log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export { prisma };

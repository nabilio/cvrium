import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { authRoutes } from './modules/auth';
import { resumeRoutes } from './modules/resumes';
import { aiRoutes } from './modules/ai';
import { billingRoutes } from './modules/billing';
import { exportRoutes } from './modules/export';
import { publicRoutes } from './modules/public';
import { adminRoutes } from './modules/admin';

export const registerRoutes = fp(async (app: FastifyInstance) => {
  await app.register(authRoutes, { prefix: '/auth' });
  await app.register(resumeRoutes, { prefix: '/resumes' });
  await app.register(aiRoutes, { prefix: '/ai' });
  await app.register(exportRoutes, { prefix: '/export' });
  await app.register(publicRoutes, { prefix: '/p' });
  await app.register(billingRoutes, { prefix: '/billing' });
  await app.register(adminRoutes, { prefix: '/admin' });
});

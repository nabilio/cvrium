import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import fastifyJwt from '@fastify/jwt';
import { env } from '../config/env';
import { prisma } from '../services/prisma';
import { configurePassport } from '../services/passport';
import { registerSubscriptionGuard } from '../services/subscription';

export const registerPlugins = fp(async (app: FastifyInstance) => {
  app.decorate('prisma', prisma);

  await app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    cookie: {
      cookieName: 'cvrum_token',
      signed: false,
    },
  });

  app.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        await request.jwtVerify();
      } catch (error) {
        reply.unauthorized();
      }
    },
  );

  registerSubscriptionGuard(app);
  configurePassport(app);
});

declare module 'fastify' {
  interface FastifyInstance {
    prisma: typeof prisma;
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
    requireActiveSubscription: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

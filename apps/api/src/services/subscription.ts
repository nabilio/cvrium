import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';

export function registerSubscriptionGuard(app: FastifyInstance): void {
  app.decorate(
    'requireActiveSubscription',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user.sub as string;
      const subscription = await app.prisma.subscription.findFirst({
        where: {
          userId,
          status: 'active',
        },
      });
      if (!subscription) {
        return reply.forbidden('Subscription required');
      }
    },
  );
}

declare module 'fastify' {
  interface FastifyInstance {
    requireActiveSubscription: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

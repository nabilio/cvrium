import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { z } from 'zod';

export const publicRoutes = fp(async (app: FastifyInstance) => {
  app.get('/:slug', async (request, reply) => {
    const params = z.object({ slug: z.string() }).parse(request.params);
    const resume = await app.prisma.resume.findFirst({
      where: { publicSlug: params.slug, isPublic: true },
      include: { sections: { orderBy: { orderIndex: 'asc' } }, user: true },
    });
    if (!resume) {
      return reply.notFound('Resume not found');
    }

    const subscription = await app.prisma.subscription.findFirst({
      where: { userId: resume.userId, status: 'active' },
    });
    if (!subscription) {
      return reply.forbidden('Owner subscription inactive');
    }

    const { user, ...rest } = resume;
    return rest;
  });
});

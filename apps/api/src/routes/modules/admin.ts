import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { z } from 'zod';

const templateSchema = z.object({
  key: z.string().min(2),
  name: z.string().min(2),
  renderConfig: z.record(z.any()),
  variants: z.record(z.any()),
});

export const adminRoutes = fp(async (app: FastifyInstance) => {
  app.addHook('preHandler', app.authenticate);

  app.get('/templates', async () => {
    return app.prisma.template.findMany({ orderBy: { name: 'asc' } });
  });

  app.post('/templates', async (request, reply) => {
    const parse = templateSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(422).send({ errors: parse.error.flatten() });
    }
    const template = await app.prisma.template.upsert({
      where: { key: parse.data.key },
      update: parse.data,
      create: parse.data,
    });
    return reply.status(201).send(template);
  });

  app.get('/logs/ai', async () => {
    return app.prisma.aIJob.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  });
});

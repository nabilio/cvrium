import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { z } from 'zod';

const resumeSchema = z.object({
  title: z.string().min(1),
  language: z.string().min(2),
  templateKey: z.string().min(1),
});

const sectionSchema = z.object({
  type: z.enum([
    'summary',
    'experience',
    'education',
    'skills',
    'projects',
    'certs',
    'languages',
    'interests',
    'refs',
  ]),
  orderIndex: z.number().int().nonnegative(),
  content: z.record(z.any()),
});

export const resumeRoutes = fp(async (app: FastifyInstance) => {
  app.addHook('preHandler', app.authenticate);

  app.get('/', async (request) => {
    const userId = request.user.sub;
    return app.prisma.resume.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: { id: true, title: true, templateKey: true, language: true, updatedAt: true },
    });
  });

  app.post('/', async (request, reply) => {
    const parse = resumeSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(422).send({ errors: parse.error.flatten() });
    }

    const resume = await app.prisma.resume.create({
      data: {
        ...parse.data,
        userId: request.user.sub,
        sections: {
          create: [
            {
              type: 'summary',
              orderIndex: 0,
              content: { text: '' },
            },
          ],
        },
      },
      include: { sections: true },
    });

    return reply.status(201).send(resume);
  });

  app.get('/:id', async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const resume = await app.prisma.resume.findFirst({
      where: { id: params.id, userId: request.user.sub },
      include: { sections: { orderBy: { orderIndex: 'asc' } } },
    });
    if (!resume) {
      return reply.notFound('Resume not found');
    }
    return resume;
  });

  app.put('/:id', async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const parse = resumeSchema.partial().safeParse(request.body);
    if (!parse.success) {
      return reply.status(422).send({ errors: parse.error.flatten() });
    }
    const resume = await app.prisma.resume.update({
      where: { id: params.id },
      data: parse.data,
    });
    return resume;
  });

  app.delete('/:id', async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    await app.prisma.resume.delete({ where: { id: params.id } });
    return reply.status(204).send();
  });

  app.post('/:id/sections', async (request, reply) => {
    const params = z.object({ id: z.string() }).parse(request.params);
    const parse = sectionSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(422).send({ errors: parse.error.flatten() });
    }
    const section = await app.prisma.resumeSection.create({
      data: {
        ...parse.data,
        resumeId: params.id,
      },
    });
    return reply.status(201).send(section);
  });

  app.patch('/:id/sections/:sectionId/order', async (request, reply) => {
    const params = z.object({ id: z.string(), sectionId: z.string() }).parse(request.params);
    const body = z.object({ orderIndex: z.number().int().nonnegative() }).safeParse(request.body);
    if (!body.success) {
      return reply.status(422).send({ errors: body.error.flatten() });
    }

    await app.prisma.resumeSection.update({
      where: { id: params.sectionId },
      data: { orderIndex: body.data.orderIndex },
    });

    return reply.send({ success: true });
  });
});

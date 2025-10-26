import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { z } from 'zod';
import { createPDFBuffer } from '../../services/pdf';

export const exportRoutes = fp(async (app: FastifyInstance) => {
  app.addHook('preHandler', app.authenticate);
  app.addHook('preHandler', app.requireActiveSubscription);

  app.post('/pdf', async (request, reply) => {
    const schema = z.object({ resumeId: z.string() });
    const parse = schema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(422).send({ errors: parse.error.flatten() });
    }
    const resume = await app.prisma.resume.findFirst({
      where: { id: parse.data.resumeId, userId: request.user.sub },
      include: { sections: { orderBy: { orderIndex: 'asc' } } },
    });
    if (!resume) {
      return reply.notFound('Resume not found');
    }
    const buffer = await createPDFBuffer(resume);
    reply.header('Content-Type', 'application/pdf');
    reply.header('Content-Disposition', `attachment; filename="${resume.title}.pdf"`);
    return reply.send(buffer);
  });

  app.post('/docx', async (request, reply) => {
    const schema = z.object({ resumeId: z.string() });
    const parse = schema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(422).send({ errors: parse.error.flatten() });
    }
    const resume = await app.prisma.resume.findFirst({
      where: { id: parse.data.resumeId, userId: request.user.sub },
      include: { sections: { orderBy: { orderIndex: 'asc' } } },
    });
    if (!resume) {
      return reply.notFound('Resume not found');
    }
    const docx = JSON.stringify(resume, null, 2);
    reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    reply.header('Content-Disposition', `attachment; filename="${resume.title}.docx"`);
    return reply.send(Buffer.from(docx));
  });
});

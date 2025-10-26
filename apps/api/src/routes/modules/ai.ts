import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { z } from 'zod';
import {
  atsCheck,
  coverLetter,
  generatePrefill,
  generatePrefillSection,
  optimizeByJD,
} from '../../services/aiClient';

export const aiRoutes = fp(async (app: FastifyInstance) => {
  app.addHook('preHandler', app.authenticate);

  app.post('/prefill', async (request, reply) => {
    const schema = z.object({
      text: z.string().min(10),
      language: z.enum(['fr', 'en']),
      seniority: z.enum(['junior', 'intermediate', 'senior']),
      targetRole: z.string().min(2),
      industry: z.string().optional(),
    });
    const parse = schema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(422).send({ errors: parse.error.flatten() });
    }

    const result = await generatePrefill(parse.data);
    await app.prisma.aiJob.create({
      data: {
        userId: request.user.sub,
        type: 'prefill',
        input: parse.data,
        output: result,
        status: 'success',
      },
    });
    return result;
  });

  app.post('/prefill-section', async (request, reply) => {
    const schema = z.object({
      resumeSnippet: z.unknown(),
      sectionType: z.string(),
      targetPath: z.string(),
      mode: z.enum(['append', 'replace']),
      prompt: z.string().min(5),
      language: z.string(),
    });
    const parse = schema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(422).send({ errors: parse.error.flatten() });
    }
    const result = await generatePrefillSection(parse.data);
    return result;
  });

  app.post('/optimize-by-jd', async (request, reply) => {
    const schema = z.object({
      resume: z.unknown(),
      jobDescription: z.string().min(20),
      language: z.enum(['fr', 'en']),
    });
    const parse = schema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(422).send({ errors: parse.error.flatten() });
    }
    const result = await optimizeByJD(parse.data);
    return result;
  });

  app.post('/cover-letter', async (request, reply) => {
    const schema = z.object({
      resume: z.unknown(),
      jobDescription: z.string().min(20),
      language: z.enum(['fr', 'en']),
    });
    const parse = schema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(422).send({ errors: parse.error.flatten() });
    }
    const result = await coverLetter(parse.data);
    return { content: result };
  });

  app.get('/ats-check', async (request, reply) => {
    const schema = z.object({
      resume: z.string(),
      jobDescription: z.string().optional(),
    });
    const parse = schema.safeParse(request.query);
    if (!parse.success) {
      return reply.status(422).send({ errors: parse.error.flatten() });
    }
    const resume = JSON.parse(parse.data.resume);
    const result = await atsCheck({ resume, jobDescription: parse.data.jobDescription });
    return result;
  });
});

import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const authRoutes = fp(async (app: FastifyInstance) => {
  app.post('/register', async (request, reply) => {
    const parse = credentialsSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(422).send({ errors: parse.error.flatten() });
    }

    const existing = await app.prisma.user.findUnique({ where: { email: parse.data.email } });
    if (existing) {
      return reply.badRequest('User already exists');
    }

    const passwordHash = await bcrypt.hash(parse.data.password, 12);
    const user = await app.prisma.user.create({
      data: {
        email: parse.data.email,
        passwordHash,
        provider: 'credentials',
      },
    });

    const token = await reply.jwtSign({ sub: user.id }, { expiresIn: '7d' });
    reply.setCookie('cvrum_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: app.log.level === 'info',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return reply.status(201).send({ id: user.id, email: user.email });
  });

  app.post('/login', async (request, reply) => {
    const parse = credentialsSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(422).send({ errors: parse.error.flatten() });
    }

    const user = await app.prisma.user.findUnique({ where: { email: parse.data.email } });
    if (!user || !(await bcrypt.compare(parse.data.password, user.passwordHash))) {
      return reply.unauthorized('Invalid credentials');
    }

    const token = await reply.jwtSign({ sub: user.id }, { expiresIn: '7d' });
    reply.setCookie('cvrum_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: app.log.level === 'info',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return reply.send({ id: user.id, email: user.email });
  });

  app.get('/me', { preValidation: [app.authenticate] }, async (request) => {
    const userId = request.user.sub as string;
    const user = await app.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });
    return user;
  });

  app.post('/logout', async (_request, reply) => {
    reply.clearCookie('cvrum_token', { path: '/' });
    return reply.send({ success: true });
  });
});

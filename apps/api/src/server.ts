import fastify from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifySensible from '@fastify/sensible';
import { env } from './config/env';
import { registerPlugins } from './plugins';
import { registerRoutes } from './routes';

async function buildServer() {
  const app = fastify({
    logger: true,
    trustProxy: true,
  });

  app.addContentTypeParser(
    'application/json',
    { parseAs: 'buffer' },
    function (_request, payload, done) {
      try {
        const body = payload.toString();
        if (_request.url.startsWith('/billing/webhooks')) {
          (_request as typeof _request & { rawBody: string }).rawBody = body;
        }
        const json = body.length ? JSON.parse(body) : {};
        done(null, json);
      } catch (err) {
        done(err as Error, undefined);
      }
    },
  );

  await app.register(fastifySensible);
  await app.register(fastifyCookie, {
    parseOptions: {
      sameSite: 'lax',
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
    },
  });

  await app.register(fastifyCors, {
    origin: [env.CLIENT_ORIGIN],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  });

  await app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:'],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        connectSrc: ["'self'", env.CLIENT_ORIGIN, 'https://api.openai.com'],
      },
    },
  });

  await app.register(fastifyRateLimit, {
    max: 120,
    timeWindow: '1 minute',
    hook: 'onRequest',
  });

  await registerPlugins(app);
  await registerRoutes(app);

  return app;
}

async function start() {
  const app = await buildServer();
  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  void start();
}

export { buildServer };

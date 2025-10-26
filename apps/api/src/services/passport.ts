import fastifyPassport from 'fastify-passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import type { FastifyInstance } from 'fastify';
import { env } from '../config/env';
import { prisma } from './prisma';

export function configurePassport(app: FastifyInstance): void {
  app.register(fastifyPassport.initialize());
  app.register(fastifyPassport.secureSession());

  fastifyPassport.use(
    new GoogleStrategy(
      {
        clientID: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
        callbackURL: env.GOOGLE_REDIRECT_URI,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) {
            return done(new Error('Email required'), undefined);
          }

          const user = await prisma.user.upsert({
            where: { email },
            create: {
              email,
              passwordHash: '',
              provider: 'google',
            },
            update: {},
          });

          done(null, { id: user.id, email: user.email });
        } catch (error) {
          done(error as Error, undefined);
        }
      },
    ),
  );

  fastifyPassport.registerUserSerializer(async (user) => user as { id: string });
  fastifyPassport.registerUserDeserializer(async (user) => user as { id: string });
}

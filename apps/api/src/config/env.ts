import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3008),
  DB_HOST: z.string(),
  DB_PORT: z.coerce.number().default(3306),
  DB_USER: z.string(),
  DB_PASS: z.string(),
  DB_NAME: z.string(),
  JWT_SECRET: z.string().min(32),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URI: z.string().url(),
  OPENAI_API_KEY: z.string(),
  AI_MODEL: z.string().default('gpt-4o-mini'),
  AI_TEMPERATURE: z.coerce.number().default(0.2),
  CLIENT_ORIGIN: z.string().url(),
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_PRICE_ID: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string(),
  PAYPAL_CLIENT_ID: z.string(),
  PAYPAL_CLIENT_SECRET: z.string(),
  PAYPAL_PLAN_ID: z.string(),
  PAYPAL_WEBHOOK_ID: z.string(),
  TRIAL_DAYS: z.coerce.number().min(0).default(7),
  PAID_FEATURES_EXPORT: z.string().transform((value) => value === 'true'),
});

const parsed = envSchema.parse(process.env);

export const env = parsed;

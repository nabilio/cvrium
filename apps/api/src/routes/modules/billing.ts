import type { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import Stripe from 'stripe';
import { env } from '../../config/env';

const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' });

export const billingRoutes = fp(async (app: FastifyInstance) => {
  app.post('/stripe/checkout', { preHandler: app.authenticate }, async (request, reply) => {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: env.STRIPE_PRICE_ID, quantity: 1 }],
      success_url: `${env.CLIENT_ORIGIN}/account/billing?success=true`,
      cancel_url: `${env.CLIENT_ORIGIN}/pricing?canceled=true`,
      client_reference_id: request.user.sub,
    });
    return reply.redirect(303, session.url ?? `${env.CLIENT_ORIGIN}/pricing`);
  });

  app.get('/stripe/portal', { preHandler: app.authenticate }, async (request, reply) => {
    const subscription = await app.prisma.subscription.findFirst({
      where: { userId: request.user.sub, provider: 'stripe' },
    });
    if (!subscription?.customerId) {
      return reply.badRequest('No Stripe customer');
    }

    const portal = await stripe.billingPortal.sessions.create({
      customer: subscription.customerId,
      return_url: `${env.CLIENT_ORIGIN}/account/billing`,
    });
    return { url: portal.url };
  });

  app.post('/webhooks/stripe', async (request, reply) => {
    const signature = request.headers['stripe-signature'];
    if (!signature) {
      return reply.unauthorized('Missing signature');
    }
    const rawBody = request.rawBody ?? JSON.stringify(request.body);
    const event = stripe.webhooks.constructEvent(rawBody, signature, env.STRIPE_WEBHOOK_SECRET);
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object as Stripe.Invoice;
      await app.prisma.subscription.upsert({
        where: { customerId: invoice.customer as string },
        update: {
          status: 'active',
          currentPeriodEnd: new Date(invoice.lines.data[0]?.period?.end ?? Date.now()),
        },
        create: {
          userId: invoice.metadata?.userId ?? '',
          provider: 'stripe',
          status: 'active',
          customerId: invoice.customer as string,
          priceId: invoice.lines.data[0]?.price?.id ?? env.STRIPE_PRICE_ID,
          currentPeriodEnd: new Date(invoice.lines.data[0]?.period?.end ?? Date.now()),
        },
      });
    }
    return reply.send({ received: true });
  });

  app.post('/paypal/create', { preHandler: app.authenticate }, async (_request, reply) => {
    return reply.redirect(303, 'https://www.paypal.com/checkoutnow');
  });

  app.post('/webhooks/paypal', async (_request, reply) => {
    return reply.send({ received: true });
  });
});

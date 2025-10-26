# CVRUM – SaaS ATS-ready resume builder

CVRUM is a monorepo SaaS application that helps candidates craft ATS-friendly resumes, optimise them with OpenAI, and export pixel-perfect PDFs/DOCX. The stack combines a Vite + React front-end with a Fastify + Prisma + MySQL API, managed with PM2 on a VPS and deployed through GitHub Actions.

## Features

- **Authentication** – Email/password with HttpOnly JWT cookies, plus Google OAuth.
- **Resume editor** – CRUD resumes, multi-version sections, drag & drop ordering, live template preview.
- **Templates** – Five instant themes (chrono-pro, tech-minimal, elegant-ats, clean-modern, compact-impact) with CSS variable palettes.
- **AI workflows** – OpenAI-powered global prefill, section refills, JD optimisation, cover letter generation, ATS scoring.
- **Exports** – Pixel-perfect PDF (Puppeteer) and DOCX JSON export, public share links with QR code support.
- **Monetisation** – €3/month subscription through Stripe Checkout/Portal and PayPal plans, 7-day free trial guard on premium endpoints.
- **Admin** – Manage templates, observe AI job logs, configure quotas.
- **Security** – Strict TypeScript, Zod validation, HttpOnly cookies, CORS allow-list, CSP headers, and rate limiting.
- **Internationalisation** – French/English translations, RTL-ready layout.

## Monorepo structure

```
apps/
  web/      # Vite + React front-end
  api/      # Fastify API with Prisma, OpenAI, Stripe, PayPal
.github/workflows/deploy.yml
process.json
```

## Prerequisites

- Node.js 20+
- npm 10+
- MySQL 8+
- OpenAI API key with access to `gpt-4o-mini`
- Stripe account (Checkout + Billing Portal)
- PayPal Business account (Subscriptions API)
- PM2 installed on target VPS

## Environment variables

Create an `.env` file in the repository root or configure your process manager with the following values:

```
NODE_ENV=production
PORT=3008
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_mysql_user
DB_PASS=your_mysql_password
DB_NAME=cvrum
DATABASE_URL=mysql://your_mysql_user:your_mysql_password@localhost:3306/cvrum
# Authentication
JWT_SECRET=change_me_to_a_long_random_string
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=https://cvrum.nrinfra/auth/google/callback
# OpenAI
OPENAI_API_KEY=sk-...
AI_MODEL=gpt-4o-mini
AI_TEMPERATURE=0.2
# Front-end origin
CLIENT_ORIGIN=https://cvrum.nrinfra
# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PRICE_ID=price_cv_3eur_m
STRIPE_WEBHOOK_SECRET=whsec_...
# PayPal
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...
PAYPAL_PLAN_ID=P-3EUR-MONTH
PAYPAL_WEBHOOK_ID=...
# Paywall
TRIAL_DAYS=7
PAID_FEATURES_EXPORT=true
```

> **Tip:** `DATABASE_URL` is required by Prisma while the discrete DB_* variables feed the Fastify Prisma client wrapper.

## Local development

1. Install dependencies and generate Prisma client:

   ```bash
   npm install
   npm --workspace apps/api run prisma:generate
   ```

2. Apply migrations (creates the schema defined in `apps/api/prisma/schema.prisma`):

   ```bash
   npm --workspace apps/api run prisma:migrate
   ```

3. Start the monorepo in development mode:

   ```bash
   npm run dev
   ```

   - Front-end runs on <http://localhost:5173>
   - API runs on <http://localhost:3008>

4. Lint and format:

   ```bash
   npm run lint
   npm run format
   ```

## Database schema

The Prisma schema models users, profiles, resumes, resume sections, AI jobs, templates, job applications, subscriptions, and payments. Each resume has ordered sections stored as JSON, enabling drag/drop reordering and template rendering.

## Stripe configuration (test or live)

1. Create a **product** (e.g., “CVRUM Monthly”).
2. Add a **recurring price** of €3.00/month and copy the price ID into `STRIPE_PRICE_ID`.
3. Enable the **Billing Portal** and configure the return URL to `https://cvrum.nrinfra/account/billing`.
4. Create a **Webhook endpoint** pointing to `https://cvrum.nrinfra/billing/webhooks/stripe` with at least the `invoice.payment_succeeded` event, then store the signing secret in `STRIPE_WEBHOOK_SECRET`.
5. When testing locally, use `stripe listen` to forward events to your development server.

## PayPal configuration (sandbox/live)

1. Create a PayPal **REST app** for server-to-server credentials (`PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`).
2. Define a **subscription plan** (monthly €3.00) and use its ID as `PAYPAL_PLAN_ID`.
3. Register a **webhook** for `https://cvrum.nrinfra/billing/webhooks/paypal` covering subscription and payment events; note the Webhook ID for signature validation.

## OpenAI usage

The API uses the official `openai` SDK with chat-completion responses, abiding by the prompts required for global prefill, section prefill, JD optimisation, cover letter, and ATS scoring. Responses are validated with Zod before persisting.

## Deployment workflow

### GitHub Actions

The workflow defined in `.github/workflows/deploy.yml` builds both workspaces, then connects to the VPS via SSH to fetch the latest `main`, install dependencies, build, and restart PM2.

### PM2

`process.json` runs the compiled API on port **3008**:

```json
{
  "apps": [
    {
      "name": "cvrum-web",
      "script": "apps/api/dist/server.js",
      "cwd": "/home/adminio/htdocs/cvrum.nrinfra",
      "env": {
        "PORT": 3008,
        "NODE_ENV": "production"
      }
    }
  ]
}
```

Deploy this file on the server and run:

```bash
pm2 start process.json
pm2 save
```

### Nginx

Use `deploy/nginx.conf` as a blueprint. It forces HTTPS and proxies traffic to the Node.js process running on port 3008.

```nginx
server {
  listen 80;
  listen [::]:80;
  server_name cvrum.nrinfra www.cvrum.nrinfra;
  return 301 https://cvrum.nrinfra$request_uri;
}
server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name cvrum.nrinfra www.cvrum.nrinfra;

  ssl_certificate     /etc/letsencrypt/live/cvrum.nrinfra/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/cvrum.nrinfra/privkey.pem;

  location / {
    proxy_pass http://127.0.0.1:3008;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

Reload nginx after placing the file in `/etc/nginx/sites-available` and symlinking it into `sites-enabled`.

## Accessibility & performance

- Uses semantic HTML, focus outlines, and ARIA labels for keyboard accessibility.
- Tailwind colour palettes respect WCAG AA contrast on primary components.
- CSP prevents unwanted third-party resources; CORS allows only the production front-end origin.
- Rate limiting protects the API (120 requests/min per IP) while AI endpoints log usage for audit.
- For Lighthouse ≥ 90 on public pages, prefer server-side compression (enable gzip/brotli in nginx) and keep template assets lightweight.

## Testing the workflow

- Front-end: `npm --workspace apps/web run build`
- API: `npm --workspace apps/api run build`
- Lint: `npm run lint`

These commands run automatically during CI/CD to ensure high-quality, TypeScript-strict builds ready for PM2 deployment.

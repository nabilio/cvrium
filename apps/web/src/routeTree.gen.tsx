import { createRootRoute, createRoute } from '@tanstack/react-router';
import { RootLayout } from './routes/RootLayout';
import { LoginPage } from './routes/LoginPage';
import { DashboardPage } from './routes/DashboardPage';
import { ResumeEditorPage } from './routes/ResumeEditorPage';
import { PublicResumePage } from './routes/PublicResumePage';
import { PricingPage } from './routes/PricingPage';
import { BillingPage } from './routes/BillingPage';
import { AdminPage } from './routes/AdminPage';

const rootRoute = createRootRoute({
  component: RootLayout,
});

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  component: LoginPage,
});

const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: DashboardPage,
});

const resumeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/resume/$resumeId',
  component: ResumeEditorPage,
});

const publicRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/p/$slug',
  component: PublicResumePage,
});

const pricingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pricing',
  component: PricingPage,
});

const billingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/account/billing',
  component: BillingPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/admin',
  component: AdminPage,
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  dashboardRoute,
  resumeRoute,
  publicRoute,
  pricingRoute,
  billingRoute,
  adminRoute,
]);

export { routeTree };

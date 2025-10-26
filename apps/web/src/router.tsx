import { createRouter, Router } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen';

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

export const router: Router = createRouter({
  routeTree,
  defaultPreload: 'intent',
  context: {
    auth: null,
  },
});

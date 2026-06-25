import { test, expect } from './fixtures';
import { ROUTES } from '../src/constants';

// Smoke test: every app page mounts and renders its navigation chrome without
// crashing, even with no cluster datasource configured (CI has none). The
// shared PageHeader (with its "Plugin config" link) is rendered unconditionally,
// before any data loads, so it is a stable "the page mounted" signal.
const routes = [
  `${ROUTES.ClusterStatus}/x`,
  `${ROUTES.ApplicationsOverview}/x`,
  `${ROUTES.NodesOverview}/x`,
  `${ROUTES.Events}/x`,
  `${ROUTES.Services}/x`,
  `${ROUTES.Cost}/x`,
  `${ROUTES.Logs}/x`,
  `${ROUTES.Traces}/x`,
];

test.describe('app pages render', () => {
  for (const route of routes) {
    test(`${route} renders its header`, async ({ gotoPage, page }) => {
      await gotoPage(`/${route}`);
      await expect(page.getByRole('link', { name: /Plugin config/i }).first()).toBeVisible();
    });
  }
});

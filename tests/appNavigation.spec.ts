import { test, expect } from './fixtures';
import { ROUTES } from '../src/constants';

test.describe('navigating app', () => {
  test('clusters page renders', async ({ gotoPage, page }) => {
    await gotoPage(`/${ROUTES.Clusters}`);
    await expect(page.getByRole('button', { name: /Add new cluster/i })).toBeVisible();
  });
});

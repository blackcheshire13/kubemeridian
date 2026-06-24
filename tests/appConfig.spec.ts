import { test, expect } from './fixtures';

test('app config page shows KubeGraf info and an enable/clusters action', async ({ appConfigPage, page }) => {
  await expect(page.getByRole('heading', { name: /KubeGraf/i }).first()).toBeVisible();
  await expect(page.getByRole('button', { name: /Enable plugin/i }).or(page.getByRole('link', { name: /Open Clusters/i })).first()).toBeVisible();
});

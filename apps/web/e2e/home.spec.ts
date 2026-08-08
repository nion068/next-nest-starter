import { expect, test } from '@playwright/test';
test('shows localized sign-in page', async ({ page }) => {
  await page.goto('/en');
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
  await page.getByRole('link', { name: 'বাংলা' }).click();
  await expect(page.getByRole('heading', { name: 'সাইন ইন' })).toBeVisible();
});

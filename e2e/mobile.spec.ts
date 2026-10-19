import { test, expect } from '@playwright/test';

test('mobile 375px responsive layout', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });

  // Check landing page on mobile
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  const input = page.locator('input[aria-label="Repository URL or owner and name"]');
  await expect(input).toBeVisible();

  // Check report page on mobile
  await page.goto('/r/facebook/react');
  await expect(page.locator('h2')).toContainText('facebook/react');
  await expect(page.locator('text=68')).toBeVisible();

  // Tabs work on mobile
  await page.click('button[role="tab"]:has-text("Report")');
  await expect(page.locator('text=Health categories')).toBeVisible();
});

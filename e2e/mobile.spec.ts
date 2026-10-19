import { test, expect } from '@playwright/test';

test('mobile 375px responsive layout with no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });

  await page.addInitScript(() => {
    localStorage.setItem('repometric_tour_seen', 'true');
  });

  // Check landing page on mobile
  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  const input = page.locator('#repo-input-field');
  await expect(input).toBeVisible();

  // Verify no horizontal overflow on mobile landing
  const scrollWidthLanding = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidthLanding).toBeLessThanOrEqual(380);

  // Check report page on mobile
  await page.goto('/r/facebook/react');
  await expect(page.locator('text=facebook/react').first()).toBeVisible();

  // Tabs work on mobile
  await page.click('button[role="tab"]:has-text("Fixes")');
  await expect(page.locator('text=Prioritized fix list')).toBeVisible();

  // Verify no horizontal scroll on report page
  const scrollWidthReport = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidthReport).toBeLessThanOrEqual(380);
});

import { test, expect } from '@playwright/test';

test('landing page to analysis screen, report page, tabs, and theme toggle', async ({
  page,
}) => {
  // Prevent tour popup from interrupting initial tab clicks
  await page.addInitScript(() => {
    localStorage.setItem('repometric_tour_seen', 'true');
  });

  // 1. Open landing page
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await expect(page).toHaveTitle(/RepoMetric/);
  await expect(page.locator('h1')).toContainText('Is your repo any good?');

  // 2. Submit a repo
  const input = page.locator('#repo-input-field');
  await input.fill('facebook/react');
  await page.locator('button:has-text("Analyze repo")').first().click();

  // 3. Watch analysis screen
  await expect(page.locator('text=Analyzing facebook/react').first()).toBeVisible();
  // Verify header has analyzing status badge and NO floating 'Analyze a repo' button
  await expect(page.locator('header button:has-text("Analyze a repo")')).toHaveCount(0);
  await expect(page.locator('header').getByText('Analyzing facebook/react...')).toBeVisible();

  // 4. Land on report page
  await expect(page).toHaveURL(/\/r\/facebook\/react/, { timeout: 10000 });
  await expect(page.locator('text=facebook/react').first()).toBeVisible();
  await expect(page.locator('text=68').first()).toBeVisible();
  await expect(page.locator('text=Needs work').first()).toBeVisible();
  // Verify report page header has compact repo search and NO duplicate 'Analyze a repo' button
  await expect(page.locator('header button:has-text("Analyze a repo")')).toHaveCount(0);
  await expect(page.locator('header input#repo-input-field')).toBeVisible();

  // 5. Switch tabs: Fixes, Map, Graph, Diagram, Overview
  await page.click('button[role="tab"]:has-text("Fixes")');
  await expect(page.locator('text=Prioritized fix list')).toBeVisible();

  await page.click('button[role="tab"]:has-text("Map")');
  await expect(page.locator('text=Treemap zoom')).toBeVisible();

  await page.click('button[role="tab"]:has-text("Graph")');
  await expect(page.locator('text=Force-directed graph')).toBeVisible();

  await page.click('button[role="tab"]:has-text("Diagram")');
  await expect(page.locator('text=Architecture Layers')).toBeVisible();

  await page.click('button[role="tab"]:has-text("Overview")');
  await expect(page.locator('text=Health categories')).toBeVisible();

  // 6. Test manual tour trigger with exact button name
  await page.locator('button:has-text("Tour")').click();
  await expect(page.locator('text=1/3 Health Score & Verdict')).toBeVisible();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.locator('text=2/3 Prioritized Fix List')).toBeVisible();
  await page.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.locator('text=3/3 Interactive Code Map')).toBeVisible();
  await page.getByRole('button', { name: 'Got it!', exact: true }).click();

  // 7. Toggle theme
  const darkButton = page.locator('button[aria-label="Dark mode"]').first();
  await darkButton.click();
  const theme = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
  expect(theme).toBe('dark');
});

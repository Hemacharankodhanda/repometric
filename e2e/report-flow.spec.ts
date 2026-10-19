import { test, expect } from '@playwright/test';

test('landing page to report page navigation, tab switching, and map interaction', async ({
  page,
}) => {
  // 1. Open landing page
  await page.goto('/');
  await expect(page).toHaveTitle(/RepoMetric/);
  await expect(page.locator('h1')).toContainText(
    'See the shape and health of any public repository',
  );

  // 2. Submit "facebook/react"
  const input = page.locator('input[aria-label="Repository URL or owner and name"]');
  await input.fill('facebook/react');
  await page.click('button:has-text("Analyze repository")');

  // 3. Land on report page
  await expect(page).toHaveURL(/\/r\/facebook\/react/);
  await expect(page.locator('h2')).toContainText('facebook/react');
  await expect(page.locator('text=68')).toBeVisible();
  await expect(page.locator('text=Needs work')).toBeVisible();

  // 4. Switch tabs: Graph, Report, and Map
  await page.click('button[role="tab"]:has-text("Graph")');
  await expect(page.locator('text=Dependency graph coming next')).toBeVisible();

  await page.click('button[role="tab"]:has-text("Report")');
  await expect(page.locator('text=Health categories')).toBeVisible();
  await expect(page.locator('text=Prioritized fix list')).toBeVisible();

  await page.click('button[role="tab"]:has-text("Map")');
  const canvas = page.locator('canvas[aria-label="Repository treemap visualization"]');
  await expect(canvas).toBeVisible();

  // 5. Zoom into a folder on the map
  const box = await canvas.boundingBox();
  if (box) {
    await page.mouse.click(box.x + box.width * 0.25, box.y + box.height * 0.25);
  }
  const rootCrumb = page.locator('button:has-text("root")');
  await expect(rootCrumb).toBeVisible();
  await rootCrumb.click();
});

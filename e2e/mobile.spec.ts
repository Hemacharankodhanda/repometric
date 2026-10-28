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

  // Mock analyze API for fast, reliable mobile testing
  await page.route('**/api/analyze', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        cached: true,
        analysis: {
          repo: {
            owner: 'facebook',
            name: 'react',
            description: 'The library for web and native user interfaces.',
            stars: 220000,
            archived: false,
            defaultBranch: 'main',
            license: 'MIT',
            homepage: 'https://react.dev',
            topics: ['javascript', 'react'],
            hasWiki: false,
          },
          commitSha: 'fb1234567890abcdef',
          score: 68,
          grade: 'needs-work',
          categories: [],
          fixes: [],
          projectedScore: 86,
          analyzedAt: new Date().toISOString(),
          coreVersion: '0.1.0',
        },
        files: [
          {
            path: 'packages/react/src/React.js',
            size: 8400,
            language: 'JavaScript',
            isTest: false,
          },
        ],
        graph: {
          status: 'ready',
          data: {
            nodes: [
              {
                id: 'packages/react/src/React.js',
                folder: 'packages/react/src',
                language: 'JavaScript',
                size: 8400,
                fanIn: 1,
                fanOut: 0,
                isTest: false,
              },
            ],
            edges: [],
            externals: [],
            stats: {
              nodeCount: 1,
              edgeCount: 0,
              unresolvedCount: 0,
              cycles: [],
              orphans: [],
              topFanIn: [],
              topFanOut: [],
            },
            truncated: false,
            collapsedToFolders: false,
          },
        },
      }),
    });
  });

  // Check report page on mobile
  await page.goto('/r/facebook/react');
  const fixesTab = page.locator('button[role="tab"]:has-text("Fixes")');
  await expect(fixesTab).toBeVisible({ timeout: 15000 });
  await fixesTab.click();
  await expect(page.locator('text=Prioritized fix list')).toBeVisible();

  // Verify no horizontal scroll on report page
  const scrollWidthReport = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidthReport).toBeLessThanOrEqual(380);
});

import { test, expect } from '@playwright/test';

test('landing page to analysis screen, report page, tabs, and theme toggle', async ({ page }) => {
  // Prevent tour popup from interrupting initial tab clicks
  await page.addInitScript(() => {
    localStorage.setItem('repometric_tour_seen', 'true');
  });

  // 1. Mock API analysis response for reliable, isolated execution in test environment
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
            topics: ['javascript', 'react', 'ui'],
            hasWiki: false,
          },
          commitSha: 'fb1234567890abcdef',
          score: 68,
          grade: 'needs-work',
          categories: [
            {
              id: 'activity',
              label: 'Activity',
              weight: 20,
              earned: 14,
              excluded: false,
              signals: [],
            },
            {
              id: 'maintenance',
              label: 'Maintenance',
              weight: 20,
              earned: 12,
              excluded: false,
              signals: [],
            },
            {
              id: 'community',
              label: 'Community',
              weight: 15,
              earned: 6,
              excluded: false,
              signals: [],
            },
            {
              id: 'documentation',
              label: 'Documentation',
              weight: 20,
              earned: 16,
              excluded: false,
              signals: [],
            },
            {
              id: 'hygiene',
              label: 'Hygiene',
              weight: 15,
              earned: 8,
              excluded: false,
              signals: [],
            },
            {
              id: 'dependencies',
              label: 'Dependencies',
              weight: 10,
              earned: 8,
              excluded: false,
              signals: [],
            },
          ],
          fixes: [
            {
              id: 'fix-1',
              signalId: 'documentation.readme_quickstart',
              title: 'Add quickstart code block to README',
              why: 'Helps developers test the package faster.',
              how: 'Add a fenced code block with usage instructions.',
              pointsGain: 4,
              effort: 'small',
              priority: 12,
            },
          ],
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
          {
            path: 'packages/react/__tests__/React-test.js',
            size: 4200,
            language: 'JavaScript',
            isTest: true,
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
                fanIn: 2,
                fanOut: 2,
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

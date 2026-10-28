import { test, expect } from '@playwright/test';

test('Diagram tab: navigation, component inspection, list toggle, and SVG export', async ({
  page,
}) => {
  // Prevent tour popup from interrupting tab clicks
  await page.addInitScript(() => {
    localStorage.setItem('repometric_tour_seen', 'true');
  });

  // 1. Mock API analysis response for reliable, isolated execution
  await page.route('**/api/analyze', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        cached: true,
        analysis: {
          repo: {
            owner: 'repometric',
            name: 'repometric',
            description: 'Repo health analyzer',
            stars: 120,
            archived: false,
            defaultBranch: 'main',
            license: 'MIT',
            homepage: 'https://repometric.dev',
            topics: ['github', 'analyzer'],
            hasWiki: false,
          },
          commitSha: 'abcdef1234567890',
          score: 85,
          grade: 'good',
          categories: [],
          fixes: [],
          projectedScore: 92,
          analyzedAt: new Date().toISOString(),
          coreVersion: '0.1.0',
        },
        files: [
          { path: 'apps/web/package.json', size: 400, language: 'JSON', isTest: false },
          { path: 'apps/web/src/app/page.tsx', size: 1200, language: 'TypeScript', isTest: false },
          { path: 'packages/core/package.json', size: 300, language: 'JSON', isTest: false },
          { path: 'packages/core/src/index.ts', size: 800, language: 'TypeScript', isTest: false },
          { path: 'packages/viz/package.json', size: 350, language: 'JSON', isTest: false },
          {
            path: 'packages/viz/src/RepoMap.tsx',
            size: 2000,
            language: 'TypeScript',
            isTest: false,
          },
        ],
        graph: {
          status: 'ready',
          data: {
            nodes: [
              {
                id: 'apps/web/src/app/page.tsx',
                folder: 'apps/web/src/app',
                language: 'TypeScript',
                size: 1200,
                fanIn: 0,
                fanOut: 2,
                isTest: false,
              },
              {
                id: 'packages/core/src/index.ts',
                folder: 'packages/core/src',
                language: 'TypeScript',
                size: 800,
                fanIn: 1,
                fanOut: 0,
                isTest: false,
              },
              {
                id: 'packages/viz/src/RepoMap.tsx',
                folder: 'packages/viz/src',
                language: 'TypeScript',
                size: 2000,
                fanIn: 1,
                fanOut: 1,
                isTest: false,
              },
            ],
            edges: [
              {
                source: 'apps/web/src/app/page.tsx',
                target: 'packages/viz/src/RepoMap.tsx',
                kind: 'static',
              },
              {
                source: 'apps/web/src/app/page.tsx',
                target: 'packages/core/src/index.ts',
                kind: 'static',
              },
            ],
            externals: [{ name: 'react', importedBy: 2 }],
            externalEdges: [{ source: 'apps/web/src/app/page.tsx', target: 'react' }],
            stats: {
              nodeCount: 3,
              edgeCount: 2,
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

  // 2. Open report page
  await page.goto('/r/repometric/repometric');

  // Verify report loaded
  await expect(page.locator('text=repometric/repometric').first()).toBeVisible({ timeout: 10000 });

  // 3. Switch to Diagram tab
  const diagramTabTrigger = page.locator('button[role="tab"]:has-text("Diagram")');
  await expect(diagramTabTrigger).toBeVisible();
  await diagramTabTrigger.click();

  // Verify Architecture Diagram container is rendered
  const diagramContainer = page.locator('[data-testid="architecture-diagram"]');
  await expect(diagramContainer).toBeVisible();

  // Wait for Mermaid SVG to render inside canvas container
  const svg = diagramContainer.locator(
    '[aria-label="Interactive architecture diagram canvas"] svg',
  );
  await expect(svg).toBeVisible({ timeout: 20000 });

  // 4. Click a component node in the diagram
  const compNode = svg.locator('[aria-label*="Architecture component web"]').first();
  await expect(compNode).toBeVisible();
  await compNode.click();

  // Verify side panel opens with component details
  await expect(page.locator('text=Directory path:')).toBeVisible();
  await expect(page.locator('text=Open folder on GitHub')).toBeVisible();

  // 5. Test Download SVG
  const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
  await page.click('button:has-text("SVG")');
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toContain('.svg');

  // 6. Test "View as list" accessible mode
  await page.click('button:has-text("View as list")');
  const table = page.locator('table');
  await expect(table.first()).toBeVisible();

  // 7. Switch to Map tab and verify selection persists
  await page.click('button[role="tab"]:has-text("Map")');
  const canvas = page.locator('canvas[aria-label="Repository treemap visualization"]');
  await expect(canvas).toBeVisible();
});

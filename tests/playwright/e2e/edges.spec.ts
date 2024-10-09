import { test, expect } from '@playwright/test';

import { FRAMEWORK } from './constants';

test.describe('Edges', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto('/tests/generic/edges/general');

    // Timeout get's ignored and tests timeout after 200ms ???
    // page.waitForSelector('[data-id="edge-with-class"]', { timeout: 5000 });
  });

  test.describe('selection', () => {
    test('selecting an edge by click', async ({ page }) => {
      const edge = page.locator(`[data-id="edge-with-class"]`);

      await expect(edge).toBeAttached();
      await edge.click();
      await expect(edge).toHaveClass(/selected/);
    });

    test('selecting multiple edges by meta-click', async ({ page }) => {
      const edge1 = page.locator('[data-id="edge-with-class"]');
      const edge2 = page.locator('[data-id="edge-with-style"]');

      await expect(edge1).toBeAttached();
      await expect(edge2).toBeAttached();

      await edge1.click();
      await expect(edge1).toHaveClass(/selected/);

      // we are using "s" here because Meta doesn't work for some reason
      await page.keyboard.down('s');
      await edge2.click();
      await page.keyboard.up('s');

      await expect(edge2).toHaveClass(/selected/);
      await expect(edge1).toHaveClass(/selected/);
    });
  });

  test.describe('properties', () => {
    test('classes get applied', async ({ page }) => {
      const edge = page.locator('[data-id="edge-with-class"]');

      await expect(edge).toHaveClass(/edge-class-test/);
    });

    test('styles get applied', async ({ page }) => {
      const edge = page.locator('[data-id="edge-with-style"]').locator(`.${FRAMEWORK}-flow__edge-path`);

      await expect(edge).toHaveCSS('stroke', 'rgb(255, 0, 0)');
    });

    test('hidden=true hides edge', async ({ page }) => {
      const edge = page.locator('#hidden-edge');

      await expect(edge).not.toBeVisible();
    });

    test('animated=true add "animated" class', async ({ page }) => {
      const edge = page.locator('[data-id="animated-edge"]');

      await expect(edge).toHaveClass(/animated/);
    });

    test('selectable=false prevents selecting of edges', async ({ page }) => {
      const edge = page.locator('[data-id="not-selectable-edge"]');

      await expect(edge).toBeAttached();
      await expect(edge).not.toHaveClass(/selected/);

      // For some reason these commands do not work
      // await expect(edge).toBeInViewport();
      // await edge.click();

      const edgeBox = await edge.boundingBox();

      await page.mouse.move(edgeBox!.x + edgeBox!.width * 0.5, edgeBox!.y + edgeBox!.height * 0.5);
      await page.mouse.down();
      await page.mouse.up();

      await expect(edge).not.toHaveClass(/selected/);
    });

    test('deleting edges is possible', async ({ page }) => {
      const edge = page.locator('[data-id="edge-with-class"]');

      await expect(edge).toBeAttached();

      await edge.click();
      await expect(edge).toHaveClass(/selected/);

      await page.keyboard.press('d');

      await expect(edge).not.toBeAttached();
    });

    test('deletable=false prevents deleting of edges', async ({ page }) => {
      const edge = page.locator('[data-id="not-deletable"]');

      await expect(edge).toBeAttached();

      // For some reason these commands do not work
      // await expect(edge).toBeInViewport();
      // await edge.click();

      const edgeBox = await edge.boundingBox();

      await page.mouse.move(edgeBox!.x + edgeBox!.width * 0.5, edgeBox!.y + edgeBox!.height * 0.5);
      await page.mouse.down();
      await page.mouse.up();

      // TODO: times out on webkit
      await expect(edge).toHaveClass(/selected/);

      await page.keyboard.press('d');
      await expect(edge).toBeAttached();
    });

    test('zIndex sets z-index of edge svgs', async ({ page }) => {
      const svg = page.locator('svg', { has: page.locator('[data-id="z-index"]') });

      await expect(svg).toBeAttached();
      await expect(svg).toHaveCSS('z-index', '3141592');
    });

    test('aria-lable is working', async ({ page }) => {
      const edge = page.locator('[data-id="aria-label"]');

      await expect(edge).toHaveAttribute('aria-label', 'aria-label-test');
    });

    test('interactionWidth is working', async ({ page }) => {
      const edge = page.locator('[data-id="interaction-width"]');

      await expect(edge).toBeAttached();

      const edgeBox = await edge.boundingBox();

      //FIXME: Negative values are not working. Investigate further
      await page.mouse.move(edgeBox!.x + edgeBox!.width * 0.5 + 21, edgeBox!.y + edgeBox!.height * 0.5);
      await page.mouse.down();
      await page.mouse.up();

      // TODO: times out on webkit
      await expect(edge).toHaveClass(/selected/);
    });

    test('marker-start, marker-end set markers', async ({ page }) => {
      const edge = page.locator('[data-id="markers"]').locator(`.${FRAMEWORK}-flow__edge-path`);

      await expect(edge).toBeAttached();

      await expect(edge).toHaveAttribute('marker-start', "url('#1__type=arrowclosed')");
      await expect(edge).toHaveAttribute('marker-end', "url('#1__type=arrow')");
    });
  });
});

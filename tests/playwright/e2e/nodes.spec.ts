import { test, expect, Locator } from '@playwright/test';

import { FRAMEWORK } from './constants';

test.describe('Nodes', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto('/tests/generic/nodes/general');
  });

  test.describe('selection', () => {
    test('selecting a node by click', async ({ page }) => {
      const locator = page.locator(`.${FRAMEWORK}-flow__node`).first();
      await locator.click();

      await expect(locator).toHaveClass(/selected/);
    });

    test('selecting multiple nodes with shift drag', async ({ page }) => {
      const nodes = page.locator(`.${FRAMEWORK}-flow__node`);
      const firstNode = nodes.first();
      const secondNode = nodes.nth(1);
      const thirdNode = nodes.nth(2);

      await expect(firstNode).toBeInViewport();
      await expect(secondNode).toBeInViewport();
      await expect(thirdNode).toBeInViewport();

      const box = await firstNode.boundingBox();

      await page.mouse.move(box!.x - 150, box!.y - 25);
      await page.keyboard.down('Shift');
      await page.mouse.down();
      await page.mouse.move(box!.x + 275, box!.y + 200);
      await page.mouse.up();
      await page.keyboard.up('Shift');

      await expect(firstNode).toHaveClass(/selected/);
      await expect(secondNode).toHaveClass(/selected/);
      await expect(thirdNode).toHaveClass(/selected/);

      let selection: Locator | undefined;
      if (FRAMEWORK === 'react') {
        selection = page.locator('.react-flow__nodesselection');
      } else if (FRAMEWORK === 'svelte') {
        selection = page.locator('.svelte-flow__selection');
      }

      if (selection) await expect(selection).toBeInViewport();
    });

    test('selectable=false prevents selection', async ({ page }) => {
      const locator = page.locator(`.${FRAMEWORK}-flow__node`).and(page.locator('[data-id="notSelectable"]'));
      await locator.click();

      await expect(locator).not.toHaveClass(/selected/);
    });
  });

  test.describe('dragging', () => {
    test('dragging a node', async ({ page }) => {
      const node = page.locator(`.${FRAMEWORK}-flow__node`).first();

      const transformBeforeMove = await node.evaluate((element) => {
        return element.style.transform;
      });

      await node.hover();
      await page.mouse.down();
      await page.mouse.move(500, 500);
      await page.mouse.up();

      const transformAfterMove = await node.evaluate((element) => {
        return element.style.transform;
      });

      expect(transformBeforeMove).not.toMatch(transformAfterMove);
    });

    test('draggable=false prevents dragging', async ({ page }) => {
      const node = page.locator(`.${FRAMEWORK}-flow__node`).and(page.locator('[data-id="notDraggable"]'));

      const transformBeforeMove = await node.evaluate((element) => {
        return element.style.transform;
      });

      await node.hover();
      await page.mouse.down();
      await page.mouse.move(500, 500);
      await page.mouse.up();

      const transformAfterMove = await node.evaluate((element) => {
        return element.style.transform;
      });

      expect(transformBeforeMove).toMatch(transformAfterMove);
    });

    test('custom drag handle works', async ({ page }) => {
      const node = page.locator(`.${FRAMEWORK}-flow__node`).and(page.locator('[data-id="drag-handle"]'));
      const dragHandle = page.locator('.custom-drag-handle');

      const transformBeforeMove = await node.evaluate((element) => {
        return element.style.transform;
      });

      const nodeBox = await node.boundingBox();

      await page.mouse.move(nodeBox!.x + 10, nodeBox!.y + 10);
      await page.mouse.down();
      await page.mouse.move(500, 500);
      await page.mouse.up();

      const transformAfterMove = await node.evaluate((element) => {
        return element.style.transform;
      });

      expect(transformBeforeMove).toMatch(transformAfterMove);

      await dragHandle.hover();
      await page.mouse.down();
      await page.mouse.move(500, 500);
      await page.mouse.up();

      const transformAfterDragHandleMove = await node.evaluate((element) => {
        return element.style.transform;
      });

      expect(transformBeforeMove).not.toMatch(transformAfterDragHandleMove);
    });
  });

  test.describe('deleting', () => {
    test('deleting a node and its edges', async ({ page }) => {
      const node = page.locator(`.${FRAMEWORK}-flow__node`).and(page.locator('[data-id="Node-1"]'));

      await node.click();
      await page.keyboard.press('d');

      await expect(node).not.toBeAttached();

      const edges = await page.locator(`.${FRAMEWORK}-flow__edge`).all();
      expect(edges).toHaveLength(0);
    });

    // deleting needs to be done with other than backspace because of webkit
    test('deletable=false prevents deletion', async ({ page }) => {
      const node = page.locator(`.${FRAMEWORK}-flow__node`).and(page.locator('[data-id="notDeletable"]'));

      await expect(node).toBeAttached();

      await node.click();
      await expect(node).toBeAttached();
      await page.keyboard.press('d');

      await expect(node).toBeAttached();
    });
  });

  test.describe('connecting', () => {
    test('connecting two nodes', async ({ page }) => {
      const outputSourceHandle = page.locator(`.${FRAMEWORK}-flow__handle`).and(page.locator('[data-nodeid="Node-1"]'));
      const inputSourceHandle = page.locator(`.${FRAMEWORK}-flow__handle`).and(page.locator('[data-nodeid="Node-4"]'));

      await expect(outputSourceHandle).toBeInViewport();
      await expect(inputSourceHandle).toBeInViewport();

      const edgesBefore = await page.locator(`.${FRAMEWORK}-flow__edge`).all();

      await outputSourceHandle.hover();
      await page.mouse.down();
      await inputSourceHandle.hover();
      await page.mouse.up();

      const edgesAfter = await page.locator(`.${FRAMEWORK}-flow__edge`).all();
      expect(edgesAfter).toHaveLength(edgesBefore.length + 1);
    });

    test('connecting two output handles does not work', async ({ page }) => {
      const firstOutputHandle = page.locator(`.${FRAMEWORK}-flow__handle`).and(page.locator('[data-nodeid="Node-2"]'));
      const secondOutputHandle = page.locator(`.${FRAMEWORK}-flow__handle`).and(page.locator('[data-nodeid="Node-4"]'));

      await expect(firstOutputHandle).toBeInViewport();
      await expect(secondOutputHandle).toBeInViewport();

      const edgesBefore = await page.locator(`.${FRAMEWORK}-flow__edge`).all();

      await firstOutputHandle.hover();
      await page.mouse.down();
      await secondOutputHandle.hover({ force: true });
      await page.mouse.up();

      const edgesAfter = await page.locator(`.${FRAMEWORK}-flow__edge`).all();
      expect(edgesAfter).toHaveLength(edgesBefore.length);
    });

    test('connecting two input handles does not work', async ({ page }) => {
      const firstInputHandle = page.locator(`.${FRAMEWORK}-flow__handle`).and(page.locator('[data-nodeid="Node-1"]'));
      const secondInputHandle = page
        .locator(`.${FRAMEWORK}-flow__handle`)
        .and(page.locator('[data-nodeid="Node-3"]'))
        .and(page.locator('.source'));

      await expect(firstInputHandle).toBeInViewport();
      await expect(secondInputHandle).toBeInViewport();

      const edgesBefore = await page.locator(`.${FRAMEWORK}-flow__edge`).all();

      await firstInputHandle.hover();
      await page.mouse.down();
      await secondInputHandle.hover({ force: true });
      await page.mouse.up();

      const edgesAfter = await page.locator(`.${FRAMEWORK}-flow__edge`).all();
      expect(edgesAfter).toHaveLength(edgesBefore.length);
    });

    test('connectable=false prevents connections', async ({ page }) => {
      const outputHandle = page.locator(`.${FRAMEWORK}-flow__handle`).and(page.locator('[data-nodeid="Node-1"]'));
      const notConnectableHandle = page
        .locator(`.${FRAMEWORK}-flow__handle`)
        .and(page.locator('[data-nodeid="notConnectable"]'));

      const notConnectableBox = await notConnectableHandle.boundingBox();

      await expect(outputHandle).toBeInViewport();
      await expect(notConnectableHandle).toBeInViewport();

      const edgesBefore = await page.locator(`.${FRAMEWORK}-flow__edge`).all();

      await outputHandle.hover();
      await page.mouse.down();
      await page.mouse.move(notConnectableBox!.x + 2, notConnectableBox!.y + 2);
      await page.mouse.up();

      const edgesAfter = await page.locator(`.${FRAMEWORK}-flow__edge`).all();
      expect(edgesAfter).toHaveLength(edgesBefore.length);
    });
  });

  test('hidden=true hides the node', async ({ page }) => {
    const node = page.locator(`.${FRAMEWORK}-flow__node`).and(page.locator('[data-id="hidden"]'));

    await expect(node).not.toBeInViewport();
  });

  test('classes get applied', async ({ page }) => {
    const node = page.locator(`.${FRAMEWORK}-flow__node`).and(page.locator('[data-id="Node-1"]'));

    await expect(node).toHaveClass(/playwright-test-class-123/);
  });

  test('styles get applied', async ({ page }) => {
    const node = page.locator(`.${FRAMEWORK}-flow__node`).and(page.locator('[data-id="Node-1"]'));

    await expect(node).toHaveCSS('background-color', 'rgb(255, 0, 0)');
  });
});

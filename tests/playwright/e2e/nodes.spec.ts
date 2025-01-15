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
      let nodeSelection = page.locator(
        FRAMEWORK === 'react' ? '.react-flow__nodesselection' : '.svelte-flow__selection'
      );
      let selection = page.locator(FRAMEWORK === 'react' ? '.react-flow__selection' : '.svelte-flow__selection');

      const nodes = page.locator(`.${FRAMEWORK}-flow__node`);

      await expect(nodes.first()).toHaveCSS('visibility', 'visible');
      await expect(nodes.nth(1)).toHaveCSS('visibility', 'visible');
      await expect(nodes.nth(2)).toHaveCSS('visibility', 'visible');
      const box = await nodes.first().boundingBox();

      await page.keyboard.down('Shift');
      await page.mouse.move(box!.x - 150, box!.y - 25);
      await page.mouse.down();
      await page.mouse.move(box!.x + 275, box!.y + 200);

      await expect(selection).toBeInViewport();
      await page.mouse.up();
      await page.keyboard.up('Shift');

      await expect(nodes.first()).toHaveClass(/selected/);
      await expect(nodes.nth(1)).toHaveClass(/selected/);
      await expect(nodes.nth(2)).toHaveClass(/selected/);

      await expect(nodeSelection).toBeInViewport();
    });

    test('selectable=false prevents selection', async ({ page }) => {
      const locator = page.locator(`.${FRAMEWORK}-flow__node`).and(page.locator('[data-id="notSelectable"]'));
      await expect(page.locator(`.${FRAMEWORK}-flow__nodes`).first()).toHaveCSS('visibility', 'visible');
      await locator.click();

      await expect(locator).not.toHaveClass(/selected/);
    });
  });

  test.describe('dragging', () => {
    test('dragging a node', async ({ page }) => {
      const node = page.locator(`.${FRAMEWORK}-flow__node`).first();

      await expect(node).toHaveCSS('visibility', 'visible');

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
      await expect(node).toHaveCSS('visibility', 'visible');

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
      await expect(node).toHaveCSS('visibility', 'visible');
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
      await expect(node).toHaveCSS('visibility', 'visible');

      await node.click();
      await page.keyboard.press('d');

      await expect(node).not.toBeAttached();

      const edges = await page.locator(`.${FRAMEWORK}-flow__edge`).all();
      expect(edges).toHaveLength(0);
    });

    // TODO: pressing backspace creates problems on webkit
    test('deletable=false prevents deletion', async ({ page }) => {
      const node = page.locator(`.${FRAMEWORK}-flow__node`).and(page.locator('[data-id="notDeletable"]'));
      await expect(node).toHaveCSS('visibility', 'visible');

      await expect(node).toBeAttached();

      await node.click();
      await page.keyboard.press('d');

      await expect(node).toBeAttached();
    });
  });

  test.describe('connecting', () => {
    test('connecting two nodes', async ({ page }) => {
      let connectionLine = page.locator(`.${FRAMEWORK}-flow__connectionline`);
      const outputSourceHandle = page.locator(`.${FRAMEWORK}-flow__handle`).and(page.locator('[data-nodeid="Node-1"]'));
      const inputSourceHandle = page.locator(`.${FRAMEWORK}-flow__handle`).and(page.locator('[data-nodeid="Node-4"]'));

      await expect(page.locator(`.${FRAMEWORK}-flow__nodes`).first()).toHaveCSS('visibility', 'visible');
      await expect(outputSourceHandle).toBeInViewport();
      await expect(inputSourceHandle).toBeInViewport();

      await expect(page.locator(`.${FRAMEWORK}-flow__edge`)).toHaveCount(2);

      await outputSourceHandle.hover();
      await page.mouse.down();
      await inputSourceHandle.hover();
      await expect(connectionLine).toBeInViewport();
      await page.mouse.up();

      await expect(connectionLine).not.toBeInViewport();

      await expect(page.locator('[data-id="xy-edge__Node-1-Node-4"]')).toBeInViewport();

      await expect(page.locator(`.${FRAMEWORK}-flow__edge`)).toHaveCount(3);
    });

    test('connecting two output handles does not work', async ({ page }) => {
      let connectionLine = page.locator(`.${FRAMEWORK}-flow__connectionline`);
      const firstOutputHandle = page.locator(`.${FRAMEWORK}-flow__handle`).and(page.locator('[data-nodeid="Node-2"]'));
      const secondOutputHandle = page.locator(`.${FRAMEWORK}-flow__handle`).and(page.locator('[data-nodeid="Node-4"]'));

      await expect(page.locator(`.${FRAMEWORK}-flow__nodes`).first()).toHaveCSS('visibility', 'visible');
      await expect(firstOutputHandle).toBeInViewport();
      await expect(secondOutputHandle).toBeInViewport();

      await expect(page.locator(`.${FRAMEWORK}-flow__edge`)).toHaveCount(2);

      await firstOutputHandle.hover();
      await page.mouse.down();

      // TODO: Does not work in SvelteFlow for whatever reason!?
      // await secondOutputHandle.hover();
      // but the following works...
      const box = await secondOutputHandle.boundingBox();
      await page.mouse.move(box!.x + 2, box!.y + 2);

      await expect(connectionLine).toBeInViewport();
      await page.mouse.up();

      await expect(connectionLine).not.toBeInViewport();

      await expect(page.locator(`.${FRAMEWORK}-flow__edge`)).toHaveCount(2);
    });

    test('connecting two input handles does not work', async ({ page }) => {
      let connectionLine = page.locator(`.${FRAMEWORK}-flow__connectionline`);
      const firstInputHandle = page.locator(`.${FRAMEWORK}-flow__handle`).and(page.locator('[data-nodeid="Node-1"]'));
      const secondInputHandle = page
        .locator(`.${FRAMEWORK}-flow__handle`)
        .and(page.locator('[data-nodeid="Node-3"]'))
        .and(page.locator('.source'));

      await expect(page.locator(`.${FRAMEWORK}-flow__nodes`).first()).toHaveCSS('visibility', 'visible');
      await expect(firstInputHandle).toBeInViewport();
      await expect(secondInputHandle).toBeInViewport();

      await expect(page.locator(`.${FRAMEWORK}-flow__edge`)).toHaveCount(2);

      await firstInputHandle.hover();
      await page.mouse.down();

      // TODO: Does not work in SvelteFlow for whatever reason!?
      // await secondInputHandle.hover();
      // but the following works...
      const box = await secondInputHandle.boundingBox();
      await page.mouse.move(box!.x + 2, box!.y + 2);

      await expect(connectionLine).toBeInViewport();
      await page.mouse.up();

      await expect(connectionLine).not.toBeInViewport();

      await expect(page.locator(`.${FRAMEWORK}-flow__edge`)).toHaveCount(2);
    });

    test('connectable=false prevents connections', async ({ page }) => {
      const outputHandle = page.locator(`.${FRAMEWORK}-flow__handle`).and(page.locator('[data-nodeid="Node-1"]'));
      const notConnectableHandle = page
        .locator(`.${FRAMEWORK}-flow__handle`)
        .and(page.locator('[data-nodeid="notConnectable"]'));

      const notConnectableBox = await notConnectableHandle.boundingBox();

      await expect(page.locator(`.${FRAMEWORK}-flow__nodes`).first()).toHaveCSS('visibility', 'visible');
      await expect(outputHandle).toBeInViewport();
      await expect(notConnectableHandle).toBeInViewport();

      await expect(page.locator(`.${FRAMEWORK}-flow__edge`)).toHaveCount(2);

      await outputHandle.hover();
      await page.mouse.down();
      await page.mouse.move(notConnectableBox!.x + 2, notConnectableBox!.y + 2);
      await page.mouse.up();

      await expect(page.locator(`.${FRAMEWORK}-flow__edge`)).toHaveCount(2);
    });
  });

  test('hidden=true hides the node', async ({ page }) => {
    const node = page.locator(`.${FRAMEWORK}-flow__node`).and(page.locator('[data-id="hidden"]'));

    await expect(node).not.toBeInViewport();
  });

  test('classes get applied', async ({ page }) => {
    const node = page.locator(`.${FRAMEWORK}-flow__node`).and(page.locator('[data-id="Node-1"]'));
    await expect(node).toHaveCSS('visibility', 'visible');

    await expect(node).toHaveClass(/playwright-test-class-123/);
  });

  test('styles get applied', async ({ page }) => {
    const node = page.locator(`.${FRAMEWORK}-flow__node`).and(page.locator('[data-id="Node-1"]'));
    await expect(node).toHaveCSS('visibility', 'visible');

    await expect(node).toHaveCSS('background-color', 'rgb(255, 0, 0)');
  });
});

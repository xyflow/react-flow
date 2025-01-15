<script lang="ts">
  import {
    shortcut,
    type ShortcutEventDetail,
    type ShortcutModifierDefinition
  } from '@svelte-put/shortcut';
  import { isInputDOMNode, isMacOs } from '@xyflow/system';

  import type { KeyHandlerProps } from './types';
  import type { KeyDefinition, KeyDefinitionObject } from '$lib/types';
  import { useSvelteFlow } from '$lib/hooks/useSvelteFlow.svelte';

  let {
    store,
    selectionKey = 'Shift',
    multiSelectionKey = isMacOs() ? 'Meta' : 'Control',
    deleteKey = 'Backspace',
    panActivationKey = ' ',
    zoomActivationKey = isMacOs() ? 'Meta' : 'Control'
  }: KeyHandlerProps = $props();

  let { deleteElements } = useSvelteFlow();

  function isKeyObject(key?: KeyDefinition | null): key is KeyDefinitionObject {
    return key !== null && typeof key === 'object';
  }

  function getModifier(key?: KeyDefinition | null): ShortcutModifierDefinition {
    return isKeyObject(key) ? key.modifier || [] : [];
  }

  function getKeyString(key?: KeyDefinition | null): string {
    if (key === null || key === undefined) {
      // this is a workaround to check if a key is set
      // if not we won't call the callback
      return '';
    }

    return isKeyObject(key) ? key.key : key;
  }

  function getShortcutTrigger(
    key: KeyDefinition | KeyDefinition[] | null | undefined,
    callback: (detail: ShortcutEventDetail) => void
  ) {
    const keys = Array.isArray(key) ? key : [key];
    return keys.map((_key) => {
      const keyString = getKeyString(_key);
      return {
        key: keyString,
        modifier: getModifier(_key),
        enabled: keyString !== null,
        callback
      };
    });
  }

  function resetKeysAndSelection() {
    store.selectionRect = null;
    store.selectionKeyPressed = false;
    store.multiselectionKeyPressed = false;
    store.deleteKeyPressed = false;
    store.panActivationKeyPressed = false;
    store.zoomActivationKeyPressed = false;
  }

  async function handleDelete() {
    const selectedNodes = store.nodes.filter((node) => node.selected);
    const selectedEdges = store.edges.filter((edge) => edge.selected);

    const { deletedNodes, deletedEdges } = await deleteElements({
      nodes: selectedNodes,
      edges: selectedEdges
    });

    if (deletedNodes.length > 0 || deletedEdges.length > 0) {
      store.ondelete?.({
        nodes: deletedNodes,
        edges: deletedEdges
      });
    }
  }
</script>

<svelte:window
  on:blur={resetKeysAndSelection}
  on:contextmenu={resetKeysAndSelection}
  use:shortcut={{
    trigger: getShortcutTrigger(selectionKey, () => (store.selectionKeyPressed = true)),
    type: 'keydown'
  }}
  use:shortcut={{
    trigger: getShortcutTrigger(selectionKey, () => (store.selectionKeyPressed = false)),
    type: 'keyup'
  }}
  use:shortcut={{
    trigger: getShortcutTrigger(multiSelectionKey, () => {
      store.multiselectionKeyPressed = true;
    }),
    type: 'keydown'
  }}
  use:shortcut={{
    trigger: getShortcutTrigger(multiSelectionKey, () => (store.multiselectionKeyPressed = false)),
    type: 'keyup'
  }}
  use:shortcut={{
    trigger: getShortcutTrigger(deleteKey, (detail) => {
      const isModifierKey =
        detail.originalEvent.ctrlKey ||
        detail.originalEvent.metaKey ||
        detail.originalEvent.shiftKey;
      if (!isModifierKey && !isInputDOMNode(detail.originalEvent)) {
        store.deleteKeyPressed = true;
        handleDelete();
      }
    }),
    type: 'keydown'
  }}
  use:shortcut={{
    trigger: getShortcutTrigger(deleteKey, () => (store.deleteKeyPressed = false)),
    type: 'keyup'
  }}
  use:shortcut={{
    trigger: getShortcutTrigger(panActivationKey, () => (store.panActivationKeyPressed = true)),
    type: 'keydown'
  }}
  use:shortcut={{
    trigger: getShortcutTrigger(panActivationKey, () => (store.panActivationKeyPressed = false)),
    type: 'keyup'
  }}
  use:shortcut={{
    trigger: getShortcutTrigger(zoomActivationKey, () => (store.zoomActivationKeyPressed = true)),
    type: 'keydown'
  }}
  use:shortcut={{
    trigger: getShortcutTrigger(zoomActivationKey, () => (store.zoomActivationKeyPressed = false)),
    type: 'keyup'
  }}
/>

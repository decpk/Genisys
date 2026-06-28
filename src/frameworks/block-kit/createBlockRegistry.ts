import type { BlockDefinition, BlockRegistry } from './types'

/**
 * Create a reactive block registry (Map + listener set), mirroring the repo's
 * `createShortcutRegistry`/`createPanelRegistry` pattern. `getBlocks` returns a
 * cached snapshot so it is safe to drive `useSyncExternalStore` without looping.
 */
export function createBlockRegistry(initial: BlockDefinition[] = []): BlockRegistry {
  const blocks = new Map<string, BlockDefinition>()
  const listeners = new Set<() => void>()
  for (const block of initial) blocks.set(block.tag, block)

  let snapshot: readonly BlockDefinition[] = [...blocks.values()]
  const refresh = (): void => {
    snapshot = [...blocks.values()]
    for (const listener of listeners) listener()
  }

  return {
    getBlocks: () => snapshot,
    get: (tag) => blocks.get(tag),
    register(block) {
      blocks.set(block.tag, block)
      refresh()
    },
    unregister(tag) {
      if (blocks.delete(tag)) refresh()
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => {
        listeners.delete(listener)
      }
    },
  }
}

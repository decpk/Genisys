import { useMemo } from 'react'

import { useSettingsStore } from '@/store/settings-store'

import { QuickPromptsTile } from '../../components/QuickPromptsTile'
import { QUICK_PROMPTS_TILE_ID } from '../tile-ids.constants'
import type { RegisteredTile } from '../TileRegistry.types'

/**
 * Quick Prompts tile — singleton, default-shown.
 *
 * Width is persisted in `useSettingsStore.quickPromptsTileWidth`.
 */
export function useQuickPromptsTileEntry(): RegisteredTile {
  const width = useSettingsStore((s) => s.quickPromptsTileWidth)
  const setWidth = useSettingsStore((s) => s.setQuickPromptsTileWidth)

  return useMemo<RegisteredTile>(() => {
    return {
      id: QUICK_PROMPTS_TILE_ID,
      kind: 'quick-prompts',
      width,
      setWidth,
      render: (handle) => (
        <QuickPromptsTile
          tileWidth={width}
          onWidthChange={setWidth}
          dragHandleProps={handle}
        />
      ),
    }
  }, [width, setWidth])
}

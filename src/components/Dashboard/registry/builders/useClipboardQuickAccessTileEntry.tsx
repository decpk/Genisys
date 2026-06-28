import { useMemo } from 'react'

import { useSettingsStore } from '@/store/settings-store'

import { ClipboardQuickAccessTile } from '../../components/ClipboardQuickAccessTile'
import { CLIPBOARD_QUICK_ACCESS_TILE_ID } from '../tile-ids.constants'
import type { RegisteredTile } from '../TileRegistry.types'

/**
 * Clipboard Quick Access tile — singleton, default-shown.
 *
 * Width is persisted in `useSettingsStore.clipboardQuickAccessTileWidth`.
 */
export function useClipboardQuickAccessTileEntry(): RegisteredTile {
  const width = useSettingsStore((s) => s.clipboardQuickAccessTileWidth)
  const setWidth = useSettingsStore((s) => s.setClipboardQuickAccessTileWidth)

  return useMemo<RegisteredTile>(() => {
    return {
      id: CLIPBOARD_QUICK_ACCESS_TILE_ID,
      kind: 'clipboard-quick-access',
      width,
      setWidth,
      render: (handle) => (
        <ClipboardQuickAccessTile
          tileWidth={width}
          onWidthChange={setWidth}
          dragHandleProps={handle}
        />
      ),
    }
  }, [width, setWidth])
}

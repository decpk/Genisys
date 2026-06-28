import { useMemo } from 'react'

import { useSettingsStore } from '@/store/settings-store'

import { SnippetsTile } from '../../components/SnippetsTile'
import { SNIPPETS_TILE_ID } from '../tile-ids.constants'
import type { RegisteredTile } from '../TileRegistry.types'

/**
 * The Snippets tile is always present; this hook returns a single
 * `RegisteredTile` describing it.
 *
 * Width is persisted in `useSettingsStore.snippetsTileWidth`.
 */
export function useSnippetsTileEntry(): RegisteredTile {
  const snippetsTileWidth = useSettingsStore((s) => s.snippetsTileWidth)
  const setSnippetsTileWidth = useSettingsStore((s) => s.setSnippetsTileWidth)

  return useMemo<RegisteredTile>(() => {
    return {
      id: SNIPPETS_TILE_ID,
      kind: 'snippets',
      width: snippetsTileWidth,
      setWidth: setSnippetsTileWidth,
      render: (handle) => (
        <SnippetsTile
          tileWidth={snippetsTileWidth}
          onWidthChange={setSnippetsTileWidth}
          dragHandleProps={handle}
        />
      ),
    }
  }, [snippetsTileWidth, setSnippetsTileWidth])
}

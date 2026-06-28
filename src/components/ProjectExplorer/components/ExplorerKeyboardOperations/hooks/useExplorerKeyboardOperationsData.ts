import { useCallback, useMemo } from 'react'

import { useExplorerContextMenuData } from '../../ExplorerContextMenu/useExplorerContextMenuData'
import type { ExplorerContextMenuData } from '../../ExplorerContextMenu/useExplorerContextMenuData'
import { buildExplorerShortcutHandlers } from '../utils/buildExplorerShortcutHandlers'
import { useExplorerOperationsKeyListener } from './useExplorerOperationsKeyListener'
import type {
  ExplorerKeyboardOperationsProps,
  ExplorerShortcutAction
} from '../ExplorerKeyboardOperations.types'

export function useExplorerKeyboardOperationsData(
  props: ExplorerKeyboardOperationsProps
): { data: ExplorerContextMenuData } {
  const { containerRef, item, rootPath, source, onChanged, onFileHistory } = props

  const data = useExplorerContextMenuData({
    item,
    isLocal: source === 'local',
    rootPath,
    onFileHistory,
    onChanged,
    children: null
  })

  const handlers = useMemo(() => buildExplorerShortcutHandlers(data), [data])

  const onAction = useCallback(
    (action: ExplorerShortcutAction) => {
      handlers[action]?.()
    },
    [handlers]
  )

  useExplorerOperationsKeyListener({
    containerRef,
    enabled: source === 'local',
    isDialogOpen: data.activeDialog !== null,
    onAction
  })

  return { data }
}

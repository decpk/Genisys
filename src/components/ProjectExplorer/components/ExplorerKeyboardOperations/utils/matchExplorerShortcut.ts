import type { ExplorerShortcutAction } from '../ExplorerKeyboardOperations.types'

export function matchExplorerShortcut(event: KeyboardEvent): ExplorerShortcutAction | null {
  const mod = event.metaKey || event.ctrlKey
  const key = event.key.toLowerCase()

  if (event.key === 'F2') return 'rename'

  const isForwardDelete = event.key === 'Delete'
  const isBackspace = event.key === 'Backspace'

  if ((isForwardDelete && event.shiftKey) || (isBackspace && mod && event.shiftKey)) {
    return 'deletePermanent'
  }

  if (isForwardDelete || (isBackspace && mod)) {
    return 'softDelete'
  }

  if (!mod) return null

  if (!event.shiftKey && key === 'c') return 'copy'
  if (event.shiftKey && key === 'c') return 'copyPath'
  if (key === 'x') return 'cut'
  if (key === 'v') return 'paste'
  if (key === 'd') return 'duplicate'
  if (!event.shiftKey && key === 'n') return 'newFile'
  if (event.shiftKey && key === 'n') return 'newFolder'
  if (key === 'i') return 'properties'

  return null
}

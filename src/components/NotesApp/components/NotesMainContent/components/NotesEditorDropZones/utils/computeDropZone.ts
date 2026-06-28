import type { NotesDropMode, NotesDropZone } from '../NotesEditorDropZones.types'

/** Maps a pointer position within a rect to the nearest drop zone. */
export function computeDropZone(
  rect: DOMRect,
  clientX: number,
  clientY: number,
  mode: NotesDropMode,
): NotesDropZone {
  if (mode === 'replace') return 'center'
  if (rect.width === 0 || rect.height === 0) return 'center'

  const relX = (clientX - rect.left) / rect.width
  const relY = (clientY - rect.top) / rect.height

  const distLeft = relX
  const distRight = 1 - relX
  const distTop = relY
  const distBottom = 1 - relY

  const min = Math.min(distLeft, distRight, distTop, distBottom)
  if (min === distLeft) return 'left'
  if (min === distRight) return 'right'
  if (min === distTop) return 'top'
  return 'bottom'
}

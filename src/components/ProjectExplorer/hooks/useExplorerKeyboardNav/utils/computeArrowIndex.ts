import { clampIndex } from './clampIndex'

export type ArrowDirection = 'up' | 'down' | 'left' | 'right'

interface ComputeArrowIndexParams {
  direction: ArrowDirection
  currentIndex: number
  itemCount: number
  columns: number
}

/**
 * Compute the next active item index for an Arrow key press.
 *
 * 1D views (columns === 1): Up/Left → -1, Down/Right → +1.
 * 2D views (columns > 1):   Up/Down → ±columns, Left/Right → ±1.
 *
 * When currentIndex is -1 (no active item), Down/Right pick 0 and Up/Left pick the last item.
 */
export function computeArrowIndex(params: ComputeArrowIndexParams): number {
  const { direction, currentIndex, itemCount, columns } = params
  if (itemCount <= 0) return -1

  if (currentIndex < 0) {
    if (direction === 'down' || direction === 'right') return 0
    return itemCount - 1
  }

  const cols = columns < 1 ? 1 : columns

  let delta = 0
  if (direction === 'down') delta = cols
  else if (direction === 'up') delta = -cols
  else if (direction === 'right') delta = 1
  else if (direction === 'left') delta = -1

  return clampIndex(currentIndex + delta, itemCount)
}

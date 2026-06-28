import type { CarryOverEntry } from '../../CarryOverBanner.types'

export interface CarryOverItemRowProps {
  entry: CarryOverEntry
  onMove: (entry: CarryOverEntry) => void
  onCopy: (entry: CarryOverEntry) => void
}

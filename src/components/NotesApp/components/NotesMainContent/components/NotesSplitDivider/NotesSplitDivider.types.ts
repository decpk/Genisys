export type NotesSplitDividerOrientation = 'side-by-side' | 'stacked'

export interface NotesSplitDividerProps {
  orientation: NotesSplitDividerOrientation
  /** Bounds to measure the pointer against (the split container element). */
  containerRef: React.RefObject<HTMLDivElement | null>
  /** Called continuously while dragging with the new fraction (0..1) for the first pane. */
  onRatioChange: (ratio: number) => void
  /** Called on double-click to reset the divider to its default position. */
  onReset?: () => void
}

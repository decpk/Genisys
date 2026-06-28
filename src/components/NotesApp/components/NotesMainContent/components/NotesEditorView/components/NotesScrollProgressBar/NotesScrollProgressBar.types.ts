import type { Ref } from 'react'

export interface NotesScrollProgressBarProps {
  /** Ref attached to the inner fill element whose width reflects scroll progress. */
  fillRef: Ref<HTMLDivElement>
  /** Ref attached to the percentage label pinned to the leading edge of the fill. */
  labelRef: Ref<HTMLDivElement>
  /** Whether to render the thin progress bar fill (and its rail background). */
  showBar: boolean
  /** Whether to render the scroll percentage label. */
  showLabel: boolean
}

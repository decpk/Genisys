import type { NotesSplitOrientation, NotesSplitSide } from '@/store/notes-app-store'

import type { NotesDropZone } from '../NotesEditorDropZones.types'

export interface ZoneSplitTarget {
  orientation: NotesSplitOrientation
  side: NotesSplitSide
}

/** Translates a drop zone into the split orientation + side it should create. */
export function zoneToSplit(zone: NotesDropZone): ZoneSplitTarget {
  switch (zone) {
    case 'left':
      return { orientation: 'side-by-side', side: 'first' }
    case 'right':
      return { orientation: 'side-by-side', side: 'second' }
    case 'top':
      return { orientation: 'stacked', side: 'first' }
    case 'bottom':
      return { orientation: 'stacked', side: 'second' }
    default:
      return { orientation: 'side-by-side', side: 'second' }
  }
}

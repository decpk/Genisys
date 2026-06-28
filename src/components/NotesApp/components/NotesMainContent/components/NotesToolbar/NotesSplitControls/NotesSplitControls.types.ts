import type { NotesSplitOrientation } from '@/store/notes-app-store'

export interface NotesSplitControlsProps {
  orientation: NotesSplitOrientation
  onToggleOrientation: () => void
  onSwap: () => void
  onClose: () => void
}

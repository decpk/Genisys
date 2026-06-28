import { createPanelDataContext } from '@/frameworks/right-panel'

import type { NotesPanelActions, NotesPanelData } from './Notes.types'

export const {
  Provider: NotesPanelDataProvider,
  usePanelData: useNotesPanelContextData,
  useData: useNotesData,
  useActions: useNotesActions,
} = createPanelDataContext<NotesPanelData, NotesPanelActions>('NotesPanelData')

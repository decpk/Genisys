import { useMemo } from 'react'
import { useNotesAppStore } from '@/store/notes-app-store'
import type { WikiLinkConfig } from '@/frameworks/wysiwyg-editor/extensions/wiki-link'
import { searchNotesByTitle } from '../utils/searchNotesByTitle'
import { resolveNoteIdByTitle } from '../utils/resolveNoteIdByTitle'
import { createLinkedNote } from '../utils/createLinkedNote'

/**
 * Build the stable `WikiLinkConfig` wiring the generic editor extension to the
 * Notes stores. Identity is stable (empty deps) so the editor's extension list
 * is not rebuilt on every render.
 */
export function useWikiLinkConfig(): WikiLinkConfig {
  return useMemo(
    () => ({
      search: (query) => searchNotesByTitle(query),
      resolveByTitle: (title) => resolveNoteIdByTitle(title),
      navigate: (id) => useNotesAppStore.getState().setSelectedNoteId(id),
      createNote: (title) => createLinkedNote(title),
    }),
    [],
  )
}

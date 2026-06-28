export { useNotesLinkGraph } from './hooks/useNotesLinkGraph'
export { useWikiLinkConfig } from './hooks/useWikiLinkConfig'

export { buildNotesLinkGraph } from './utils/buildNotesLinkGraph'
export { getAllNotes } from './utils/getAllNotes'
export { parseWikiLinks } from './utils/parseWikiLinks'
export { normalizeNoteTitle } from './utils/normalizeNoteTitle'
export { extractBacklinkSnippet } from './utils/extractBacklinkSnippet'
export { findUnlinkedMentions } from './utils/findUnlinkedMentions'

export {
  NOTES_APP_ID,
  NOTES_SCOPE_TYPE,
  NOTES_SCOPE_ID,
  NOTES_SCOPE_KEY,
} from './notes-links.constants'

export type {
  NotesLinkGraph,
  NotesLinkEdge,
  NoteRef,
} from './notes-links.types'

import type { ToolModule } from '@/ai/tools/tools.types'

// ── Read tools ──────────────────────────────────────────────
import getNote from './read/getNote'
import listNotes from './read/listNotes'
import searchNotes from './read/searchNotes'
import listNotebooks from './read/listNotebooks'
import getCurrentContext from './read/getCurrentContext'

// ── Write tools ─────────────────────────────────────────────
import createNote from './write/createNote'
import updateNote from './write/updateNote'
import deleteNote from './write/deleteNote'
import togglePin from './write/togglePin'
import toggleFavorite from './write/toggleFavorite'
import trashNote from './write/trashNote'
import restoreNote from './write/restoreNote'
import emptyTrash from './write/emptyTrash'
import duplicateNote from './write/duplicateNote'
import createNotebook from './write/createNotebook'
import updateNotebook from './write/updateNotebook'
import deleteNotebook from './write/deleteNotebook'
import reorderNotebooks from './write/reorderNotebooks'
import createSection from './write/createSection'
import updateSection from './write/updateSection'
import deleteSection from './write/deleteSection'
import moveSection from './write/moveSection'
import createTopic from './write/createTopic'
import updateTopic from './write/updateTopic'
import deleteTopic from './write/deleteTopic'
import moveTopic from './write/moveTopic'
import createLabel from './write/createLabel'
import updateLabel from './write/updateLabel'
import deleteLabel from './write/deleteLabel'
import setNoteLabels from './write/setNoteLabels'

// ── Navigation tools ────────────────────────────────────────
import setSidebarView from './navigation/setSidebarView'
import setSidebarFilter from './navigation/setSidebarFilter'
import toggleDistractionFree from './navigation/toggleDistractionFree'

// ── All tool modules ────────────────────────────────────────
const ALL_NOTES_TOOLS: ToolModule[] = [
  // Read
  getNote,
  listNotes,
  searchNotes,
  listNotebooks,
  getCurrentContext,
  // Write
  createNote,
  updateNote,
  deleteNote,
  togglePin,
  toggleFavorite,
  trashNote,
  restoreNote,
  emptyTrash,
  duplicateNote,
  createNotebook,
  updateNotebook,
  deleteNotebook,
  reorderNotebooks,
  createSection,
  updateSection,
  deleteSection,
  moveSection,
  createTopic,
  updateTopic,
  deleteTopic,
  moveTopic,
  createLabel,
  updateLabel,
  deleteLabel,
  setNoteLabels,
  // Navigation
  setSidebarView,
  setSidebarFilter,
  toggleDistractionFree,
]

/** Tool definitions array — sent to the AI API */
export const NOTES_TOOL_DEFINITIONS = ALL_NOTES_TOOLS.map((t) => t.definition)

/** Tool registry map — for dispatching tool calls by name */
export const NOTES_TOOL_REGISTRY: Record<string, ToolModule> = Object.fromEntries(
  ALL_NOTES_TOOLS.map((t) => [t.name, t]),
)

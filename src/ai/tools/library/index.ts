import type { ToolModule } from '@/ai/tools/tools.types'

// Read tools
import getBook from './read/getBook'
import listBooks from './read/listBooks'
import listBookmarks from './read/listBookmarks'
import searchChapters from './read/searchChapters'
import getCurrentContext from './read/getCurrentContext'

// Write tools — Books
import createBook from './write/createBook'
import updateBook from './write/updateBook'
import deleteBook from './write/deleteBook'

// Write tools — Chapters
import addChapter from './write/addChapter'
import updateChapter from './write/updateChapter'
import insertChapterContent from './write/insertChapterContent'
import appendChapterContent from './write/appendChapterContent'
import replaceChapterText from './write/replaceChapterText'
import updateChapterStatus from './write/updateChapterStatus'
import deleteChapter from './write/deleteChapter'
import toggleChapterRead from './write/toggleChapterRead'

// Write tools — Generation (placeholders)
import generateBook from './write/generateBook'
import generateChapter from './write/generateChapter'
import stopGeneration from './write/stopGeneration'

// Write tools — Bookmarks
import addBookmark from './write/addBookmark'
import removeBookmark from './write/removeBookmark'
import toggleBookmark from './write/toggleBookmark'

// Utility tools
import exportBook from './utility/exportBook'
import toggleDistractionFree from './utility/toggleDistractionFree'

const ALL_TOOLS: ToolModule[] = [
  // Read
  getBook,
  listBooks,
  listBookmarks,
  searchChapters,
  getCurrentContext,
  // Write — Books
  createBook,
  updateBook,
  deleteBook,
  // Write — Chapters
  addChapter,
  updateChapter,
  insertChapterContent,
  appendChapterContent,
  replaceChapterText,
  updateChapterStatus,
  deleteChapter,
  toggleChapterRead,
  // Write — Generation
  generateBook,
  generateChapter,
  stopGeneration,
  // Write — Bookmarks
  addBookmark,
  removeBookmark,
  toggleBookmark,
  // Utility
  exportBook,
  toggleDistractionFree,
]

/** Tool definitions array — sent to the AI API */
export const LIBRARY_TOOL_DEFINITIONS = ALL_TOOLS.map((t) => t.definition)

/** Tool registry map — for dispatching tool calls by name */
export const LIBRARY_TOOL_REGISTRY: Record<string, ToolModule> = Object.fromEntries(
  ALL_TOOLS.map((t) => [t.name, t]),
)

/** Read-only tool names — used to gate tools in Plan/Ask modes. */
export const LIBRARY_READ_TOOL_NAMES: ReadonlySet<string> = new Set<string>([
  'library_get_book',
  'library_list_books',
  'library_list_bookmarks',
  'library_search_chapters',
  'library_get_current_context',
])

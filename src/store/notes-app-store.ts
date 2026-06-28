import { create } from 'zustand'
import type { ContentWidth, NotesMode } from './settings-store'
import type { Note } from './notes-store'
import { readPersistedNotesApp } from './notes-app-store/persistence/readPersistedNotesApp'
import { persistNotesAppState } from './notes-app-store/persistence/persistNotesAppState'
import { readInitialSplitState } from './notes-app-store/utils/readInitialSplitState'
import { openSplitAction } from './notes-app-store/actions/openSplit'
import { closeSplitAction } from './notes-app-store/actions/closeSplit'
import { setSplitOrientationAction } from './notes-app-store/actions/setSplitOrientation'
import { setSplitRatioAction } from './notes-app-store/actions/setSplitRatio'
import { setActivePaneAction } from './notes-app-store/actions/setActivePane'
import { swapPanesAction } from './notes-app-store/actions/swapPanes'
import { setPaneModeAction } from './notes-app-store/actions/setPaneMode'
import { setPaneContentWidthAction } from './notes-app-store/actions/setPaneContentWidth'
import { setPaneNoteAction } from './notes-app-store/actions/setPaneNote'
import { reconcileSplitWithNotesAction } from './notes-app-store/actions/reconcileSplitWithNotes'
import type {
  NotesPaneIndex,
  NotesSplitOrientation,
  NotesSplitSide,
  NotesSplitState,
} from './notes-app-store/notes-app-store.types'

export type {
  NotesPaneIndex,
  NotesPaneState,
  NotesSplitOrientation,
  NotesSplitSide,
  NotesSplitState,
} from './notes-app-store/notes-app-store.types'

export type SidebarView = 'notebooks' | 'favorites' | 'trash'
export type NotesSidebarFilter = 'all' | 'notebooks' | 'unsorted' | 'pinned'
export type NotesSidebarSort =
  | 'updated-desc'
  | 'updated-asc'
  | 'title-asc'
  | 'title-desc'
  | 'created-desc'
  | 'created-asc'

interface NotesAppState {
  selectedNoteId: string | null
  selectedProjectId: string | null
  selectedNotebookId: string | null
  selectedSectionId: string | null
  selectedTopicId: string | null
  selectedLabelId: string | null
  searchQuery: string
  expandedNodeIds: string[]
  distractionFree: boolean
  sidebarView: SidebarView
  sidebarFilter: NotesSidebarFilter
  sidebarSort: NotesSidebarSort
  trashedNotes: Note[]
  /** Active two-pane split, or null when a single note is shown. */
  splitState: NotesSplitState | null
}

interface NotesAppActions {
  setSelectedNoteId: (id: string | null) => void
  setSelectedProjectId: (id: string | null) => void
  setSelectedNotebookId: (id: string | null) => void
  setSelectedSectionId: (id: string | null) => void
  setSelectedTopicId: (id: string | null) => void
  setSelectedLabelId: (id: string | null) => void
  setSearchQuery: (query: string) => void
  toggleNodeExpanded: (nodeId: string) => void
  setExpandedNodeIds: (ids: string[]) => void
  setDistractionFree: (on: boolean) => void
  toggleDistractionFree: () => void
  setSidebarView: (view: SidebarView) => void
  setSidebarFilter: (filter: NotesSidebarFilter) => void
  setSidebarSort: (sort: NotesSidebarSort) => void
  loadTrashedNotes: () => Promise<void>
  restoreFromTrash: (id: string) => Promise<void>
  emptyTrash: () => Promise<void>
  // Split layout
  openSplit: (noteId: string, orientation: NotesSplitOrientation, side: NotesSplitSide) => void
  closeSplit: (keepIndex: NotesPaneIndex) => void
  setSplitOrientation: (orientation: NotesSplitOrientation) => void
  setSplitRatio: (ratio: number) => void
  setActivePane: (index: NotesPaneIndex) => void
  swapPanes: () => void
  setPaneMode: (index: NotesPaneIndex, mode: NotesMode) => void
  setPaneContentWidth: (index: NotesPaneIndex, width: ContentWidth) => void
  setPaneNote: (index: NotesPaneIndex, noteId: string) => void
  reconcileSplitWithNotes: (validNoteIds: Set<string>) => void
}

export type NotesAppStore = NotesAppState & NotesAppActions


export const useNotesAppStore = create<NotesAppState & NotesAppActions>()((set, get) => ({
  selectedNoteId: readPersistedNotesApp()?.selectedNoteId ?? null,
  selectedProjectId: null,
  selectedNotebookId: null,
  selectedSectionId: null,
  selectedTopicId: null,
  selectedLabelId: null,
  searchQuery: '',
  expandedNodeIds: ['collapsed::section::pinned', 'collapsed::section::quicknote'],
  distractionFree: false,
  sidebarView: 'notebooks' as SidebarView,
  sidebarFilter: 'all' as NotesSidebarFilter,
  sidebarSort: 'updated-desc' as NotesSidebarSort,
  trashedNotes: [],
  splitState: readInitialSplitState(),

  setSelectedNoteId: (id) => {
    set({ selectedNoteId: id })
    persistNotesAppState(get)
  },
  setSelectedProjectId: (id) =>
    set({ selectedProjectId: id, selectedNotebookId: null, selectedSectionId: null, selectedTopicId: null }),
  setSelectedNotebookId: (id) => set({ selectedNotebookId: id, selectedSectionId: null, selectedTopicId: null }),
  setSelectedSectionId: (id) => set({ selectedSectionId: id, selectedTopicId: null }),
  setSelectedTopicId: (id) => set({ selectedTopicId: id }),
  setSelectedLabelId: (id) => set({ selectedLabelId: id }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  toggleNodeExpanded: (nodeId) =>
    set((state) => ({
      expandedNodeIds: state.expandedNodeIds.includes(nodeId)
        ? state.expandedNodeIds.filter((id) => id !== nodeId)
        : [...state.expandedNodeIds, nodeId],
    })),
  setExpandedNodeIds: (ids) => set({ expandedNodeIds: ids }),
  setDistractionFree: (on) => set({ distractionFree: on }),
  toggleDistractionFree: () => set((state) => ({ distractionFree: !state.distractionFree })),
  setSidebarView: (view) => set({ sidebarView: view }),
  setSidebarFilter: (filter) => set({ sidebarFilter: filter }),
  setSidebarSort: (sort) => set({ sidebarSort: sort }),

  loadTrashedNotes: async () => {
    try {
      const notes = (await window.api.loadTrashedNotes()) as Note[]
      set({ trashedNotes: notes })
    } catch {
      set({ trashedNotes: [] })
    }
  },

  restoreFromTrash: async (id) => {
    set((s) => ({ trashedNotes: s.trashedNotes.filter((n) => n.id !== id) }))
    await window.api.restoreNoteFromTrash(id)
  },

  emptyTrash: async () => {
    set({ trashedNotes: [] })
    await window.api.emptyTrash()
  },

  // Split layout — thin wrappers delegating to extracted service functions.
  openSplit: (noteId, orientation, side) => openSplitAction(get, set, noteId, orientation, side),
  closeSplit: (keepIndex) => closeSplitAction(get, set, keepIndex),
  setSplitOrientation: (orientation) => setSplitOrientationAction(get, set, orientation),
  setSplitRatio: (ratio) => setSplitRatioAction(get, set, ratio),
  setActivePane: (index) => setActivePaneAction(get, set, index),
  swapPanes: () => swapPanesAction(get, set),
  setPaneMode: (index, mode) => setPaneModeAction(get, set, index, mode),
  setPaneContentWidth: (index, width) => setPaneContentWidthAction(get, set, index, width),
  setPaneNote: (index, noteId) => setPaneNoteAction(get, set, index, noteId),
  reconcileSplitWithNotes: (validNoteIds) => reconcileSplitWithNotesAction(get, set, validNoteIds),
}))

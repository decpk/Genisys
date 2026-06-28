import { create } from 'zustand'

export interface NoteSource {
  appId: string
  label: string
  contextId?: string
  contextLabel?: string
}

export interface Note {
  id: string
  appId: string
  scopeType: string
  scopeId: string
  title: string
  content: string
  isPinned: boolean
  createdAt: string
  updatedAt: string
  notebookId: string | null
  sectionId: string | null
  topicId: string | null
  labels: string[]
  source: string | null
  sortOrder: number
  color: string | null
  emoji: string | null
  isFavorite: boolean
  isTrashed: boolean
  trashedAt: string | null
}

interface NoteSuggestionResult {
  id: string
  title: string
}

function scopeKey(appId: string, scopeType: string, scopeId: string): string {
  return `${appId}::${scopeType}::${scopeId}`
}

interface NotesState {
  notesByScope: Record<string, Note[]>
  loadingScopes: Set<string>
}

interface NotesActions {
  loadNotes: (appId: string, scopeType: string, scopeId: string) => Promise<void>
  addNote: (appId: string, scopeType: string, scopeId: string) => Promise<Note>
  updateNote: (note: Note) => Promise<void>
  removeNote: (id: string, appId: string, scopeType: string, scopeId: string) => Promise<void>
  togglePin: (id: string, appId: string, scopeType: string, scopeId: string) => Promise<void>
  toggleFavorite: (id: string, appId: string, scopeType: string, scopeId: string) => Promise<void>
  trashNote: (id: string, appId: string, scopeType: string, scopeId: string) => Promise<void>
  duplicateNote: (id: string, appId: string, scopeType: string, scopeId: string) => Promise<void>
  searchSuggestions: (appId: string, query: string) => Promise<NoteSuggestionResult[]>
}

export const useNotesStore = create<NotesState & NotesActions>()((set, get) => ({
  notesByScope: {},
  loadingScopes: new Set(),

  loadNotes: async (appId, scopeType, scopeId) => {
    const key = scopeKey(appId, scopeType, scopeId)
    if (get().notesByScope[key] || get().loadingScopes.has(key)) return
    set((s) => ({ loadingScopes: new Set(s.loadingScopes).add(key) }))
    try {
      const notes = (await window.api.loadNotes(appId, scopeType, scopeId)) as Note[]
      set((s) => {
        const next = new Set(s.loadingScopes)
        next.delete(key)
        return { notesByScope: { ...s.notesByScope, [key]: notes }, loadingScopes: next }
      })
    } catch {
      set((s) => {
        const next = new Set(s.loadingScopes)
        next.delete(key)
        return { notesByScope: { ...s.notesByScope, [key]: [] }, loadingScopes: next }
      })
    }
  },

  addNote: async (appId, scopeType, scopeId) => {
    const now = new Date().toISOString()
    const note: Note = {
      id: crypto.randomUUID(),
      appId,
      scopeType,
      scopeId,
      title: '',
      content: '',
      isPinned: false,
      createdAt: now,
      updatedAt: now,
      notebookId: null,
      sectionId: null,
      topicId: null,
      labels: [],
      source: null,
      sortOrder: 0,
      color: null,
      emoji: null,
      isFavorite: false,
      isTrashed: false,
      trashedAt: null,
    }
    const key = scopeKey(appId, scopeType, scopeId)
    set((s) => ({
      notesByScope: {
        ...s.notesByScope,
        [key]: [note, ...(s.notesByScope[key] ?? [])],
      },
    }))
    await window.api.saveNote(note)
    return note
  },

  updateNote: async (note) => {
    const key = scopeKey(note.appId, note.scopeType, note.scopeId)
    const updated = { ...note, updatedAt: new Date().toISOString() }
    set((s) => ({
      notesByScope: {
        ...s.notesByScope,
        [key]: (s.notesByScope[key] ?? []).map((n) => (n.id === note.id ? updated : n)),
      },
    }))
    await window.api.saveNote(updated)
  },

  removeNote: async (id, appId, scopeType, scopeId) => {
    const key = scopeKey(appId, scopeType, scopeId)
    set((s) => ({
      notesByScope: {
        ...s.notesByScope,
        [key]: (s.notesByScope[key] ?? []).filter((n) => n.id !== id),
      },
    }))
    await window.api.removeNote(id)
  },

  togglePin: async (id, appId, scopeType, scopeId) => {
    const key = scopeKey(appId, scopeType, scopeId)
    set((s) => ({
      notesByScope: {
        ...s.notesByScope,
        [key]: (s.notesByScope[key] ?? []).map((n) =>
          n.id === id ? { ...n, isPinned: !n.isPinned, updatedAt: new Date().toISOString() } : n,
        ),
      },
    }))
    await window.api.toggleNotePin(id)
  },

  toggleFavorite: async (id, appId, scopeType, scopeId) => {
    const key = scopeKey(appId, scopeType, scopeId)
    set((s) => ({
      notesByScope: {
        ...s.notesByScope,
        [key]: (s.notesByScope[key] ?? []).map((n) =>
          n.id === id ? { ...n, isFavorite: !n.isFavorite, updatedAt: new Date().toISOString() } : n,
        ),
      },
    }))
    await window.api.toggleNoteFavorite(id)
  },

  trashNote: async (id, appId, scopeType, scopeId) => {
    const key = scopeKey(appId, scopeType, scopeId)
    set((s) => ({
      notesByScope: {
        ...s.notesByScope,
        [key]: (s.notesByScope[key] ?? []).filter((n) => n.id !== id),
      },
    }))
    await window.api.trashNote(id)
  },

  duplicateNote: async (id, appId, scopeType, scopeId) => {
    const duplicated = (await window.api.duplicateNote(id)) as Note | null
    if (!duplicated) return
    const key = scopeKey(appId, scopeType, scopeId)
    set((s) => ({
      notesByScope: {
        ...s.notesByScope,
        [key]: [duplicated, ...(s.notesByScope[key] ?? [])],
      },
    }))
  },

  searchSuggestions: async (appId, query) => {
    try {
      return (await window.api.searchNoteSuggestions(appId, query)) as NoteSuggestionResult[]
    } catch {
      return []
    }
  },
}))

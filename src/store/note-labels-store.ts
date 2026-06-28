import { create } from 'zustand'

export interface NoteLabel {
  id: string
  name: string
  color: string | null
  createdAt: string
}

interface NoteLabelsState {
  labels: NoteLabel[]
  isLoaded: boolean
}

interface NoteLabelsActions {
  loadLabels: () => Promise<void>
  addLabel: (name: string, color?: string) => Promise<NoteLabel>
  updateLabel: (label: NoteLabel) => Promise<void>
  removeLabel: (id: string) => Promise<void>
  setNoteLabels: (noteId: string, labelIds: string[]) => Promise<void>
}

export const useNoteLabelsStore = create<NoteLabelsState & NoteLabelsActions>()(
  (set, get) => ({
    labels: [],
    isLoaded: false,

    loadLabels: async () => {
      if (get().isLoaded) return
      try {
        const labels = (await window.api.loadNoteLabels()) as NoteLabel[]
        set({ labels, isLoaded: true })
      } catch {
        set({ labels: [], isLoaded: true })
      }
    },

    addLabel: async (name, color) => {
      const normalized = name.toLowerCase().replace(/\s+/g, '-')
      const label: NoteLabel = {
        id: crypto.randomUUID(),
        name: normalized,
        color: color ?? null,
        createdAt: new Date().toISOString(),
      }
      set((s) => ({ labels: [...s.labels, label] }))
      window.api.saveNoteLabel(label)
      return label
    },

    updateLabel: async (label) => {
      set((s) => ({
        labels: s.labels.map((l) => (l.id === label.id ? label : l)),
      }))
      window.api.saveNoteLabel(label)
    },

    removeLabel: async (id) => {
      set((s) => ({ labels: s.labels.filter((l) => l.id !== id) }))
      window.api.removeNoteLabel(id)
    },

    setNoteLabels: async (noteId, labelIds) => {
      window.api.setNoteLabels(noteId, labelIds)
    },
  })
)

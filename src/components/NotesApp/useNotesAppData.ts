import { useEffect, useState, useCallback } from 'react'

import { useNoteNotebooksStore } from '@/store/note-notebooks-store'
import { useNoteSectionsStore } from '@/store/note-sections-store'
import { useNoteTopicsStore } from '@/store/note-topics-store'
import { useNoteLabelsStore } from '@/store/note-labels-store'
import { useNoteProjectsStore } from '@/store/note-projects-store'
import { useNotesAppStore } from '@/store/notes-app-store'
import { useNavigationStore } from '@/store/navigation-store'
import { useNotesStore } from '@/store/notes-store'
import { useSettingsStore } from '@/store/settings-store'
import { useRestoreLastOpenedNote } from './useRestoreLastOpenedNote'

export function useNotesAppData() {
  useRestoreLastOpenedNote()
  const notebooksLoaded = useNoteNotebooksStore((s) => s.isLoaded)
  const loadNotebooks = useNoteNotebooksStore((s) => s.loadNotebooks)
  const sectionsLoaded = useNoteSectionsStore((s) => s.isLoaded)
  const loadSections = useNoteSectionsStore((s) => s.loadSections)
  const topicsLoaded = useNoteTopicsStore((s) => s.isLoaded)
  const loadTopics = useNoteTopicsStore((s) => s.loadTopics)
  const labelsLoaded = useNoteLabelsStore((s) => s.isLoaded)
  const loadLabels = useNoteLabelsStore((s) => s.loadLabels)
  const projectsLoaded = useNoteProjectsStore((s) => s.isLoaded)
  const loadProjects = useNoteProjectsStore((s) => s.loadProjects)

  const loadNotes = useNotesStore((s) => s.loadNotes)
  const addNote = useNotesStore((s) => s.addNote)
  const notebooks = useNoteNotebooksStore((s) => s.notebooks)
  const loadTrashedNotes = useNotesAppStore((s) => s.loadTrashedNotes)

  const setSelectedNoteId = useNotesAppStore((s) => s.setSelectedNoteId)
  const setSelectedNotebookId = useNotesAppStore((s) => s.setSelectedNotebookId)

  const pendingQuickNote = useNavigationStore((s) => s.pendingQuickNote)
  const consumeQuickNote = useNavigationStore((s) => s.consumeQuickNote)

  const [activeTab, setActiveTab] = useState('toc')
  const [rightPanelOpen, setRightPanelOpen] = useState(true)

  // Load all data on mount. Projects are loaded alongside notebooks/sections
  // so the sidebar can render the Projects section as soon as everything is
  // hydrated.
  useEffect(() => {
    if (!projectsLoaded) loadProjects()
    if (!notebooksLoaded) loadNotebooks()
    if (!sectionsLoaded) loadSections()
    if (!topicsLoaded) loadTopics()
    if (!labelsLoaded) loadLabels()
  }, [projectsLoaded, loadProjects, notebooksLoaded, loadNotebooks, sectionsLoaded, loadSections, topicsLoaded, loadTopics, labelsLoaded, loadLabels])

  // Load notes for the notes app scope
  useEffect(() => {
    loadNotes('notes-app', 'global', 'all')
    loadTrashedNotes()
  }, [loadNotes, loadTrashedNotes])

  // Consume pending quick note
  useEffect(() => {
    if (!pendingQuickNote || !notebooksLoaded) return
    const quickNotebookId = notebooks.find((n) => n.isSystem)?.id
    if (!quickNotebookId) return

    const createQuickNote = async () => {
      const note = await addNote('notes-app', 'global', 'all')
      const sourceStr = JSON.stringify(pendingQuickNote.source)
      const updated = {
        ...note,
        title: pendingQuickNote.title,
        content: pendingQuickNote.content,
        notebookId: quickNotebookId,
        source: sourceStr,
      }
      await useNotesStore.getState().updateNote(updated)
      // New notes open in Edit mode (single-pane view derives mode from global notesMode).
      useSettingsStore.getState().setNotesMode('edit')
      setSelectedNoteId(note.id)
      setSelectedNotebookId(quickNotebookId)
      consumeQuickNote()
    }
    createQuickNote()
  }, [pendingQuickNote, notebooksLoaded, notebooks, addNote, setSelectedNoteId, setSelectedNotebookId, consumeQuickNote])

  const isLoaded = notebooksLoaded && sectionsLoaded && topicsLoaded && labelsLoaded && projectsLoaded

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId)
  }, [])

  return {
    isLoaded,
    rightPanelOpen,
    setRightPanelOpen,
    activeTab,
    handleTabChange,
  }
}

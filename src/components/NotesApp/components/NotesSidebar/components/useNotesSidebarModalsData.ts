import { useState, useCallback } from 'react'

import { useNotesStore } from '@/store/notes-store'
import { useNoteNotebooksStore } from '@/store/note-notebooks-store'
import { useNoteSectionsStore } from '@/store/note-sections-store'
import { useNoteTopicsStore } from '@/store/note-topics-store'
import { useNoteProjectsStore } from '@/store/note-projects-store'
import { useNoteLabelsStore } from '@/store/note-labels-store'
import { pickLabelColor } from '../labelColors'
import type { TreeNode } from '../useNotesSidebarData'

export type ModalType =
  | 'create-project'
  | 'create-notebook'
  | 'create-section'
  | 'create-topic'
  | 'create-label'
  | 'rename-project'
  | 'rename-notebook'
  | 'rename-section'
  | 'rename-topic'
  | 'rename-note'
  | 'delete-confirm'
  | 'move-note'
  | 'move-section'
  | 'move-topic'
  | 'move-notebook'

export interface ModalState {
  type: ModalType
  node?: TreeNode
  parentId?: string
}

export function useNotesSidebarModalsData() {
  const [modalState, setModalState] = useState<ModalState | null>(null)

  const addNotebook = useNoteNotebooksStore((s) => s.addNotebook)
  const updateNotebook = useNoteNotebooksStore((s) => s.updateNotebook)
  const removeNotebook = useNoteNotebooksStore((s) => s.removeNotebook)
  const notebooks = useNoteNotebooksStore((s) => s.notebooks)

  const addSection = useNoteSectionsStore((s) => s.addSection)
  const updateSection = useNoteSectionsStore((s) => s.updateSection)
  const removeSection = useNoteSectionsStore((s) => s.removeSection)
  const sections = useNoteSectionsStore((s) => s.sections)

  const addTopic = useNoteTopicsStore((s) => s.addTopic)
  const updateTopic = useNoteTopicsStore((s) => s.updateTopic)
  const removeTopic = useNoteTopicsStore((s) => s.removeTopic)
  const topics = useNoteTopicsStore((s) => s.topics)

  const addProject = useNoteProjectsStore((s) => s.addProject)
  const updateProject = useNoteProjectsStore((s) => s.updateProject)
  const removeProject = useNoteProjectsStore((s) => s.removeProject)
  const projects = useNoteProjectsStore((s) => s.projects)

  const addLabel = useNoteLabelsStore((s) => s.addLabel)

  const openModal = useCallback((type: ModalType, node?: TreeNode, parentId?: string) => {
    setModalState({ type, node, parentId })
  }, [])

  const closeModal = useCallback(() => {
    setModalState(null)
  }, [])

  const handleSave = useCallback(
    async (value: string) => {
      if (!modalState) return
      const { type, node, parentId } = modalState

      switch (type) {
        case 'create-project':
          await addProject(value)
          break
        case 'create-notebook':
          // parentId (if present) is the destination project id
          await addNotebook(value, undefined, false, parentId ?? null)
          break
        case 'create-section':
          if (parentId) await addSection(parentId, value)
          break
        case 'create-topic':
          if (parentId) await addTopic(parentId, value)
          break
        case 'create-label':
          await addLabel(value, pickLabelColor(value))
          break
        case 'rename-project': {
          const prj = projects.find((p) => p.id === node?.id)
          if (prj) await updateProject({ ...prj, name: value })
          break
        }
        case 'rename-notebook': {
          const nb = notebooks.find((n) => n.id === node?.id)
          if (nb) await updateNotebook({ ...nb, name: value })
          break
        }
        case 'rename-section': {
          const sec = sections.find((s) => s.id === node?.id)
          if (sec) await updateSection({ ...sec, name: value })
          break
        }
        case 'rename-topic': {
          const top = topics.find((t) => t.id === node?.id)
          if (top) await updateTopic({ ...top, name: value })
          break
        }
        case 'rename-note': {
          if (node) {
            const notes = useNotesStore.getState().notesByScope['notes-app::global::all'] ?? []
            const note = notes.find((n) => n.id === node.id)
            if (note) await useNotesStore.getState().updateNote({ ...note, title: value })
          }
          break
        }
      }
      closeModal()
    },
    [modalState, projects, notebooks, sections, topics, addProject, addNotebook, addSection, addTopic, addLabel, updateProject, updateNotebook, updateSection, updateTopic, closeModal],
  )

  const handleDelete = useCallback(async () => {
    if (!modalState?.node) return
    const { node } = modalState

    switch (node.type) {
      case 'project':
        await removeProject(node.id)
        // After a hard cascade, notes under the project's notebooks are gone
        // from SQL — wipe the in-memory note scope and reload.
        useNotesStore.setState((s) => ({
          notesByScope: { ...s.notesByScope, 'notes-app::global::all': undefined as any },
        }))
        await useNotesStore.getState().loadNotes('notes-app', 'global', 'all')
        break
      case 'notebook':
        await removeNotebook(node.id)
        break
      case 'section':
        await removeSection(node.id)
        break
      case 'topic':
        await removeTopic(node.id)
        break
      case 'note': {
        const { removeNote } = useNotesStore.getState()
        await removeNote(node.id, 'notes-app', 'global', 'all')
        break
      }
    }
    closeModal()
  }, [modalState, removeProject, removeNotebook, removeSection, removeTopic, closeModal])

  const handleMove = useCallback(
    async (targetNotebookId: string | null, targetSectionId: string | null, targetTopicId: string | null) => {
      if (!modalState?.node) return
      const { node, type } = modalState

      if (type === 'move-note') {
        await window.api.moveNote(node.id, targetNotebookId, targetSectionId, targetTopicId)
        // Reload notes to reflect the move
        const { loadNotes } = useNotesStore.getState()
        useNotesStore.setState((s) => ({ notesByScope: { ...s.notesByScope, 'notes-app::global::all': undefined as any } }))
        await loadNotes('notes-app', 'global', 'all')
      } else if (type === 'move-section' && targetNotebookId) {
        const { moveSection } = useNoteSectionsStore.getState()
        await moveSection(node.id, targetNotebookId)
        // Reload notes
        useNotesStore.setState((s) => ({ notesByScope: { ...s.notesByScope, 'notes-app::global::all': undefined as any } }))
        await useNotesStore.getState().loadNotes('notes-app', 'global', 'all')
      } else if (type === 'move-topic' && targetSectionId) {
        const { moveTopic } = useNoteTopicsStore.getState()
        await moveTopic(node.id, targetSectionId)
        // Reload notes
        useNotesStore.setState((s) => ({ notesByScope: { ...s.notesByScope, 'notes-app::global::all': undefined as any } }))
        await useNotesStore.getState().loadNotes('notes-app', 'global', 'all')
      } else if (type === 'move-notebook') {
        // For move-notebook, the MoveModal repurposes the first param to carry
        // the destination project id (null = no project).
        const { moveNotebook } = useNoteNotebooksStore.getState()
        await moveNotebook(node.id, targetNotebookId)
      }
      closeModal()
    },
    [modalState, closeModal],
  )

  return {
    modalState,
    openModal,
    closeModal,
    handleSave,
    handleDelete,
    handleMove,
    notebooks,
    sections,
    topics,
    projects,
  }
}

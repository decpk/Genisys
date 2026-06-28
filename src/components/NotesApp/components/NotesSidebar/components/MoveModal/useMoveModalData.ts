import { useCallback, useMemo, useState } from 'react'

import type { NoteNotebook } from '@/store/note-notebooks-store'
import type { MoveModalProps, MoveModalViewModel } from './MoveModal.types'
import { buildProjectNameMap } from './utils/buildProjectNameMap'
import { filterDestinationNotebooks } from './utils/filterDestinationNotebooks'
import { getNotebookProjectSuffix } from './utils/getNotebookProjectSuffix'
import { groupNotebooksByProject } from './utils/groupNotebooksByProject'
import { isMoveSelectionValid } from './utils/isMoveSelectionValid'

export function useMoveModalData(props: MoveModalProps): MoveModalViewModel {
  const { modalState, onMove, notebooks, sections, topics, projects } = props

  const [selectedNotebookId, setSelectedNotebookId] = useState<string | null>(null)
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null)
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null)
  const [expandedNotebooks, setExpandedNotebooks] = useState<Set<string>>(new Set())
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  const isMovingNote = modalState.type === 'move-note'
  const isMovingSection = modalState.type === 'move-section'
  const isMovingTopic = modalState.type === 'move-topic'

  const toggleNotebook = useCallback((id: string) => {
    setExpandedNotebooks((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const toggleSection = useCallback((id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const handleSelect = useCallback(
    (notebookId: string | null, sectionId: string | null, topicId: string | null) => {
      setSelectedNotebookId(notebookId)
      setSelectedSectionId(sectionId)
      setSelectedTopicId(topicId)
    },
    [],
  )

  const handleSave = useCallback(() => {
    if (isMovingSection) {
      onMove(selectedNotebookId, null, null)
      return
    }
    if (isMovingTopic) {
      onMove(null, selectedSectionId, null)
      return
    }
    onMove(selectedNotebookId, selectedSectionId, selectedTopicId)
  }, [
    isMovingSection,
    isMovingTopic,
    onMove,
    selectedNotebookId,
    selectedSectionId,
    selectedTopicId,
  ])

  const projectNameById = useMemo(() => buildProjectNameMap(projects), [projects])

  const filteredNotebooks = useMemo(
    () => filterDestinationNotebooks(notebooks, modalState),
    [notebooks, modalState],
  )

  const grouped = useMemo(
    () => groupNotebooksByProject(filteredNotebooks, projects),
    [filteredNotebooks, projects],
  )

  const hasSelection = useMemo(
    () =>
      isMoveSelectionValid(
        {
          notebookId: selectedNotebookId,
          sectionId: selectedSectionId,
          topicId: selectedTopicId,
        },
        modalState.type,
      ),
    [selectedNotebookId, selectedSectionId, selectedTopicId, modalState.type],
  )

  const getSuffix = useCallback(
    (notebook: NoteNotebook) => getNotebookProjectSuffix(notebook, projectNameById),
    [projectNameById],
  )

  return {
    modalState,
    sections,
    topics,
    isMovingNote,
    isMovingSection,
    isMovingTopic,
    selectedNotebookId,
    selectedSectionId,
    selectedTopicId,
    expandedNotebooks,
    expandedSections,
    grouped,
    hasSelection,
    getSuffix,
    toggleNotebook,
    toggleSection,
    handleSelect,
    handleSave,
  }
}

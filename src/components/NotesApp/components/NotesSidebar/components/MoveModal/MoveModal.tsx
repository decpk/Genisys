import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

import { MoveModalNotebookEntry } from './components/MoveModalNotebookEntry'
import { MoveModalProjectHeader } from './components/MoveModalProjectHeader'
import { MoveModalUnsortedRow } from './components/MoveModalUnsortedRow'
import {
  moveModalContentClass,
  moveModalProjectGroupNotebooksClass,
  moveModalScrollContainerClass,
} from './MoveModal.styles'
import type { MoveModalProps } from './MoveModal.types'
import { useMoveModalData } from './useMoveModalData'
import { filterDestinationSections } from './utils/filterDestinationSections'

export function MoveModal(props: MoveModalProps) {
  const { onClose } = props
  const vm = useMoveModalData(props)

  const {
    modalState,
    sections,
    topics,
    isMovingNote,
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
  } = vm

  const isUnsortedRowSelected =
    selectedNotebookId === null && selectedSectionId === null && selectedTopicId === null

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) onClose()
  }

  const handleSelectUnsorted = () => handleSelect(null, null, null)
  const handleSelectNotebook = (notebookId: string) => handleSelect(notebookId, null, null)
  const handleSelectSection = (notebookId: string | null, sectionId: string) =>
    handleSelect(notebookId, sectionId, null)
  const handleSelectTopic = (notebookId: string, sectionId: string, topicId: string) =>
    handleSelect(notebookId, sectionId, topicId)

  const renderNotebookEntry = (notebook: (typeof grouped.unsorted)[number]) => {
    const notebookSections = filterDestinationSections(sections, notebook.id, modalState)
    return (
      <MoveModalNotebookEntry
        key={notebook.id}
        notebook={notebook}
        notebookSections={notebookSections}
        topics={topics}
        projectSuffix={getSuffix(notebook)}
        isMovingNote={isMovingNote}
        isMovingTopic={isMovingTopic}
        isNotebookExpanded={expandedNotebooks.has(notebook.id)}
        isNotebookSelected={
          selectedNotebookId === notebook.id &&
          selectedSectionId === null &&
          selectedTopicId === null
        }
        selectedSectionId={selectedSectionId}
        selectedTopicId={selectedTopicId}
        expandedSections={expandedSections}
        onToggleNotebook={toggleNotebook}
        onToggleSection={toggleSection}
        onSelectNotebook={handleSelectNotebook}
        onSelectSection={handleSelectSection}
        onSelectTopic={handleSelectTopic}
      />
    )
  }

  const unsortedRow = isMovingNote ? (
    <MoveModalUnsortedRow isSelected={isUnsortedRowSelected} onSelect={handleSelectUnsorted} />
  ) : null

  const ungroupedNotebooks = grouped.unsorted.map(renderNotebookEntry)

  const projectGroups = grouped.groups.map((group, index) => {
    const isFirstHeader = index === 0 && grouped.unsorted.length === 0
    return (
      <div key={group.project.id}>
        <MoveModalProjectHeader project={group.project} isFirstHeader={isFirstHeader} />
        <div className={moveModalProjectGroupNotebooksClass}>
          {group.notebooks.map(renderNotebookEntry)}
        </div>
      </div>
    )
  })

  return (
    <Dialog open onOpenChange={handleDialogOpenChange}>
      <DialogContent className={moveModalContentClass}>
        <DialogHeader>
          <DialogTitle>Move "{modalState.node?.name}" to...</DialogTitle>
        </DialogHeader>
        <div className={moveModalScrollContainerClass}>
          {unsortedRow}
          {ungroupedNotebooks}
          {projectGroups}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!hasSelection}>
            Move
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

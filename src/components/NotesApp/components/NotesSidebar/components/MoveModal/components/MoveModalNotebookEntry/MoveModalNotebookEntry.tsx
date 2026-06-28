import { MoveModalNotebookRow } from '../MoveModalNotebookRow'
import { MoveModalSectionRow } from '../MoveModalSectionRow'
import type { MoveModalNotebookEntryProps } from './MoveModalNotebookEntry.types'

export function MoveModalNotebookEntry(props: MoveModalNotebookEntryProps) {
  const {
    notebook,
    notebookSections,
    topics,
    projectSuffix,
    isMovingNote,
    isMovingTopic,
    isNotebookExpanded,
    isNotebookSelected,
    selectedSectionId,
    selectedTopicId,
    expandedSections,
    onToggleNotebook,
    onToggleSection,
    onSelectNotebook,
    onSelectSection,
    onSelectTopic,
  } = props

  const showChildren = isMovingNote || isMovingTopic
  const canExpandNotebook = showChildren && notebookSections.length > 0
  const showExpandedChildren = canExpandNotebook && isNotebookExpanded

  let expandedChildren: React.ReactNode = null
  if (showExpandedChildren) {
    expandedChildren = notebookSections.map((section) => {
      const sectionTopics = topics.filter((topic) => topic.sectionId === section.id)
      const isSectionSelected = selectedSectionId === section.id && selectedTopicId === null
      const isSectionExpanded = expandedSections.has(section.id)
      return (
        <MoveModalSectionRow
          key={section.id}
          section={section}
          topics={sectionTopics}
          isExpanded={isSectionExpanded}
          isSelected={isSectionSelected}
          selectedTopicId={selectedTopicId}
          showTopics={isMovingNote}
          onToggle={() => onToggleSection(section.id)}
          onSelect={() => {
            if (isMovingTopic) onSelectSection(null, section.id)
            else onSelectSection(notebook.id, section.id)
          }}
          onSelectTopic={(topicId) => onSelectTopic(notebook.id, section.id, topicId)}
        />
      )
    })
  }

  return (
    <div>
      <MoveModalNotebookRow
        notebook={notebook}
        projectSuffix={projectSuffix}
        canExpand={canExpandNotebook}
        isExpanded={isNotebookExpanded}
        isSelected={isNotebookSelected}
        onToggle={() => onToggleNotebook(notebook.id)}
        onSelect={() => onSelectNotebook(notebook.id)}
      />
      {expandedChildren}
    </div>
  )
}

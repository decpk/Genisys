import { FileSearch, Link2 } from 'lucide-react'

import { BacklinkItem } from './components/BacklinkItem'
import { BacklinkSection } from './components/BacklinkSection'
import { useNotesBacklinksPanelData } from './useNotesBacklinksPanelData'
import {
  containerStyles,
  emptyStateHintStyles,
  emptyStateStyles,
  emptyStateTitleStyles,
  scrollStyles,
  sectionEmptyStyles,
} from './NotesBacklinksPanel.styles'

export function NotesBacklinksPanel(): React.JSX.Element {
  const { hasSelection, hasTitle, backlinks, unlinkedMentions, handleOpen } =
    useNotesBacklinksPanelData()

  if (!hasSelection) {
    return (
      <div className={emptyStateStyles}>
        <Link2 size={20} className="mb-2" />
        <span className={emptyStateTitleStyles}>Select a note to see its backlinks</span>
      </div>
    )
  }

  if (!hasTitle) {
    return (
      <div className={emptyStateStyles}>
        <Link2 size={20} className="mb-2" />
        <span className={emptyStateTitleStyles}>This note has no title</span>
        <span className={emptyStateHintStyles}>Links resolve by title — add one to track references</span>
      </div>
    )
  }

  let linkedContent = <span className={sectionEmptyStyles}>No linked references yet</span>
  if (backlinks.length > 0) {
    linkedContent = (
      <>
        {backlinks.map((item) => (
          <BacklinkItem key={item.noteId} item={item} onOpen={handleOpen} />
        ))}
      </>
    )
  }

  let unlinkedContent = <span className={sectionEmptyStyles}>No unlinked mentions</span>
  if (unlinkedMentions.length > 0) {
    unlinkedContent = (
      <>
        {unlinkedMentions.map((item) => (
          <BacklinkItem key={item.noteId} item={item} onOpen={handleOpen} />
        ))}
      </>
    )
  }

  return (
    <div className={containerStyles}>
      <div className={scrollStyles}>
        <BacklinkSection title="Linked references" icon={Link2} count={backlinks.length}>
          {linkedContent}
        </BacklinkSection>

        <BacklinkSection title="Unlinked mentions" icon={FileSearch} count={unlinkedMentions.length}>
          {unlinkedContent}
        </BacklinkSection>
      </div>
    </div>
  )
}

import type { JSX } from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import { Link2, FileQuestion } from 'lucide-react'

import { useWikiLinkChipData } from './useWikiLinkChipData'
import { wikiLinkChipStyles as styles } from './WikiLinkChip.styles'
import type { WikiLinkChipProps } from './WikiLinkChip.types'

/** Inline chip rendered for a `wikiLink` atom node inside the editor. */
export function WikiLinkChip(props: WikiLinkChipProps): JSX.Element {
  const { label, isResolved, handleClick } = useWikiLinkChipData(props)

  const stateClass = isResolved ? styles.resolved : styles.unresolved
  const Icon = isResolved ? Link2 : FileQuestion
  const title = isResolved ? `Open “${label}”` : `Create “${label}”`

  return (
    <NodeViewWrapper
      as="span"
      className={`${styles.chip} ${stateClass}`}
      data-type="wikiLink"
      data-label={label}
      contentEditable={false}
    >
      <button type="button" onClick={handleClick} title={title}>
        <Icon size={12} className={styles.icon} />
        {label}
      </button>
    </NodeViewWrapper>
  )
}

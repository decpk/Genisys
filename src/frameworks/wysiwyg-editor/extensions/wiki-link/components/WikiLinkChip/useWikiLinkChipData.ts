import { useCallback } from 'react'
import type { WikiLinkConfig } from '../../WikiLinkExtension.types'
import type { WikiLinkChipData, WikiLinkChipProps } from './WikiLinkChip.types'

/**
 * Derives display + click behaviour for a single wikiLink chip. Title
 * resolution is read live from the consumer config (so renames reflect on the
 * next render), and clicking navigates to the target — creating it first when
 * the title does not yet resolve.
 */
export function useWikiLinkChipData(props: WikiLinkChipProps): WikiLinkChipData {
  const { node, extension } = props
  const config = extension.options as WikiLinkConfig
  const label = (node.attrs.label as string | null)?.trim() ?? ''

  const resolvedId = label ? config.resolveByTitle(label) : null
  const isResolved = Boolean(resolvedId)

  const handleClick = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault()
      event.stopPropagation()
      if (!label) return
      const existingId = config.resolveByTitle(label)
      if (existingId) {
        config.navigate(existingId)
        return
      }
      void config.createNote(label).then((newId) => {
        if (newId) config.navigate(newId)
      })
    },
    [config, label],
  )

  return { label, isResolved, handleClick }
}

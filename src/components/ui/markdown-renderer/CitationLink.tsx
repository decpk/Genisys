import { memo, useCallback } from 'react'
import { FileCode } from 'lucide-react'

import { ENTITY_HREF_PREFIX } from '@/ai/entity-links/entity-links.constants'
import type { CitationClickHandler } from './MarkdownRenderer.types'
import { MdLink } from './elements'
import { EntityCitationLink } from './EntityCitationLink'

interface CitationLinkProps {
  href?: string
  children?: React.ReactNode
  onCitationClick?: CitationClickHandler
}

export const CitationLink = memo(function CitationLink({
  href,
  children,
  onCitationClick,
}: CitationLinkProps): React.JSX.Element {
  if (href?.startsWith(ENTITY_HREF_PREFIX)) {
    return <EntityCitationLink href={href}>{children}</EntityCitationLink>
  }

  const isCitation = href?.startsWith('#cite:')

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      if (!href || !isCitation || !onCitationClick) return
      const raw = href.slice(6) // strip '#cite:'
      const parts = raw.split(':')
      const filePath = decodeURIComponent(parts[0])
      const startLine = parts[1] ? parseInt(parts[1], 10) : undefined
      const endLine = parts[2] ? parseInt(parts[2], 10) : undefined
      const fileName = filePath.split('/').pop() ?? filePath
      onCitationClick({
        filePath,
        name: fileName,
        sourceType: 'file',
        startLine,
        endLine,
      })
    },
    [href, isCitation, onCitationClick],
  )

  if (isCitation) {
    return (
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] rounded-md bg-primary/8 text-primary hover:bg-primary/15 border border-primary/15 transition-all cursor-pointer mx-0.5 hover:shadow-sm"
      >
        <FileCode size={10} className="shrink-0" />
        {children}
      </button>
    );
  }

  return <MdLink href={href}>{children}</MdLink>
})

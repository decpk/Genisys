import { useMemo } from 'react'
import type { Components } from 'react-markdown'

import { CodeBlock } from './CodeBlock'
import { CitationLink } from './CitationLink'
import {
  MdH1,
  MdH2,
  MdH3,
  MdH4,
  MdParagraph,
  MdUnorderedList,
  MdOrderedList,
  MdListItem,
  MdBlockquote,
  MdTable,
  MdTableHeader,
  MdTableCell,
  MdHorizontalRule,
  MdImage,
} from "./elements";
import type { MarkdownVariant, CitationClickHandler } from './MarkdownRenderer.types'

/* ── Variant-based text size presets ── */

const TEXT_SIZES: Record<MarkdownVariant, { body: string; h1: string; h2: string; h3: string; h4: string }> = {
  default: { body: 'text-sm', h1: 'text-lg', h2: 'text-base', h3: 'text-sm', h4: 'text-xs' },
  compact: { body: 'text-xs', h1: 'text-base', h2: 'text-sm', h3: 'text-xs', h4: 'text-xs' },
  research: { body: 'text-sm', h1: 'text-xl', h2: 'text-lg', h3: 'text-base', h4: 'text-sm' },
}

interface UseMarkdownComponentsOptions {
  variant?: MarkdownVariant
  onCitationClick?: CitationClickHandler
  isStreaming?: boolean
}

export function useMarkdownComponents({
  variant = 'default',
  onCitationClick,
  isStreaming = false,
}: UseMarkdownComponentsOptions = {}): Components {
  return useMemo((): Components => {
    const sizes = TEXT_SIZES[variant]

    return {
      code: ((props) => <CodeBlock {...props} isStreaming={isStreaming} />) as Components["code"],

      a: (({ href, children }) => (
        <CitationLink href={href} onCitationClick={onCitationClick}>
          {children}
        </CitationLink>
      )) as Components["a"],

      h1: ({ children }) => <MdH1 className={sizes.h1}>{children}</MdH1>,
      h2: ({ children }) => <MdH2 className={sizes.h2}>{children}</MdH2>,
      h3: ({ children }) => <MdH3 className={sizes.h3}>{children}</MdH3>,
      h4: ({ children }) => <MdH4 className={sizes.h4}>{children}</MdH4>,
      p: ({ children }) => (
        <MdParagraph className={sizes.body}>{children}</MdParagraph>
      ),
      ul: ({ children }) => (
        <MdUnorderedList className={sizes.body}>{children}</MdUnorderedList>
      ),
      ol: ({ children }) => (
        <MdOrderedList className={sizes.body}>{children}</MdOrderedList>
      ),
      li: ({ children }) => <MdListItem>{children}</MdListItem>,
      blockquote: ({ children }) => (
        <MdBlockquote className={sizes.body}>{children}</MdBlockquote>
      ),
      table: ({ children }) => (
        <MdTable className={sizes.body}>{children}</MdTable>
      ),
      th: ({ children }) => <MdTableHeader>{children}</MdTableHeader>,
      td: ({ children }) => <MdTableCell>{children}</MdTableCell>,
      hr: () => <MdHorizontalRule />,
      img: ({ src, alt }) => <MdImage src={src} alt={alt} />,
    };
  }, [variant, onCitationClick, isStreaming])
}

import type { ReactElement } from 'react'
import type { Components } from 'react-markdown'

import { BlockMarkdown } from '@/frameworks/block-kit'

import { libraryBlockRegistry, librarySanitizeExtend, libraryUrlSchemes } from './blocks'
import { remarkImageSource } from './markdown-plugins/remarkImageSource'

/** Stable module-level config so `<BlockMarkdown>`'s memoization stays effective. */
const LIBRARY_REMARK_EXTRA = [remarkImageSource]
const LIBRARY_URL_SCHEMES = [...libraryUrlSchemes]

interface LibraryMarkdownProps {
  /** Markdown for a single content segment (may contain `<lib-*>` flow blocks). */
  content: string
  /** Standard-element components (headings, code, img, …) from `createMarkdownComponents`. */
  components: Partial<Components>
  /** True while the chapter is still generating. */
  isStreaming?: boolean
  className?: string
}

/**
 * The Library's single entry point onto the `block-kit` engine. Renders standard
 * markdown with the chapter's element styling, plus the Library block pack
 * (`<lib-callout>`, `<lib-summary>`). Quiz/challenge blocks are extracted as
 * segments upstream, so they never reach here.
 */
export function LibraryMarkdown({
  content,
  components,
  isStreaming,
  className,
}: LibraryMarkdownProps): ReactElement {
  return (
    <BlockMarkdown
      content={content}
      registry={libraryBlockRegistry}
      components={components}
      remarkPlugins={LIBRARY_REMARK_EXTRA}
      urlSchemes={LIBRARY_URL_SCHEMES}
      sanitize={librarySanitizeExtend}
      isStreaming={isStreaming}
      className={className}
    />
  )
}

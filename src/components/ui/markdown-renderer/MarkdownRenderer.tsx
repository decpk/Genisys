import { memo, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

import { StreamingIndicator } from '@/components/ui/streaming-indicator'
import { parseCitations } from './citations'
import { useMarkdownComponents } from './useMarkdownComponents'
import type { MarkdownRendererProps } from './MarkdownRenderer.types'

const REMARK_PLUGINS = [remarkGfm, remarkMath]
const REHYPE_PLUGINS = [rehypeKatex]

export const MarkdownRenderer = memo(function MarkdownRenderer({
  content,
  variant = 'default',
  enableCitations = false,
  onCitationClick,
  isStreaming = false,
  className,
}: MarkdownRendererProps): React.JSX.Element {
  const components = useMarkdownComponents({
    variant,
    onCitationClick: enableCitations ? onCitationClick : undefined,
    isStreaming,
  })

  const processedContent = useMemo(
    () => (enableCitations ? parseCitations(content) : content),
    [content, enableCitations],
  )

  return (
    <div className={className ?? 'select-text [&_*:not(table):not(thead):not(tbody):not(tr):not(th):not(td)]:[overflow-wrap:anywhere]'}>
      <ReactMarkdown remarkPlugins={REMARK_PLUGINS} rehypePlugins={REHYPE_PLUGINS} components={components}>
        {processedContent}
      </ReactMarkdown>
      {isStreaming && <StreamingIndicator />}
    </div>
  )
})

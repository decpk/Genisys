import type { ReactElement } from 'react'
import ReactMarkdown from 'react-markdown'

import type { BlockMarkdownProps } from './BlockMarkdown.types'
import { useBlockMarkdownData } from './useBlockMarkdownData'

/**
 * Markdown renderer with pluggable custom blocks. Standard markdown renders
 * exactly as react-markdown does (plus GFM + math); registered `<lib-*>` tags are
 * dispatched to their block renderers. Raw HTML is sanitized against a
 * registry-derived allow-list, so unknown/partial tags degrade gracefully.
 */
export function BlockMarkdown(props: BlockMarkdownProps): ReactElement {
  const { remark, rehype, mergedComponents, urlTransform } = useBlockMarkdownData(props)

  if (!props.content && props.fallback !== undefined) {
    return <div className={props.className}>{props.fallback}</div>
  }

  return (
    <div className={props.className}>
      <ReactMarkdown
        remarkPlugins={remark}
        rehypePlugins={rehype}
        components={mergedComponents}
        urlTransform={urlTransform}
      >
        {props.content}
      </ReactMarkdown>
    </div>
  )
}

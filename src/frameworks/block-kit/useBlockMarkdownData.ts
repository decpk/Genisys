import { useMemo, useSyncExternalStore } from 'react'
import type { Components } from 'react-markdown'
import type { PluggableList } from 'unified'

import type { BlockMarkdownProps } from './BlockMarkdown.types'
import { useBlockComponents } from './hooks/useBlockComponents'
import { createRehypePlugins } from './pipeline/createRehypePlugins'
import { createRemarkPlugins } from './pipeline/createRemarkPlugins'
import { buildSanitizeSchema } from './pipeline/sanitizeSchema'
import { createUrlTransform } from './pipeline/urlTransform'

interface BlockMarkdownData {
  remark: PluggableList
  rehype: PluggableList
  mergedComponents: Components
  urlTransform: (url: string) => string
}

/**
 * Assembles the memoized remark/rehype plugin sets, the merged component map
 * (standard elements + registered blocks), and the URL transform for
 * `<BlockMarkdown>`. Subscribes to the registry so dynamically-registered blocks
 * take effect.
 */
export function useBlockMarkdownData(props: BlockMarkdownProps): BlockMarkdownData {
  const { registry, components, isStreaming = false, remarkPlugins, urlSchemes, sanitize } = props

  const blocks = useSyncExternalStore(
    registry.subscribe,
    registry.getBlocks,
    registry.getBlocks,
  )

  const remark = useMemo(() => createRemarkPlugins(remarkPlugins), [remarkPlugins])
  const rehype = useMemo(
    () => createRehypePlugins(buildSanitizeSchema(blocks, sanitize)),
    [blocks, sanitize],
  )
  const mergedComponents = useBlockComponents(blocks, isStreaming, components)
  const urlTransform = useMemo(() => createUrlTransform(urlSchemes ?? []), [urlSchemes])

  return { remark, rehype, mergedComponents, urlTransform }
}

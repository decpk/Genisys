import { useMemo } from 'react'
import type { ReactNode } from 'react'
import type { Element } from 'hast'
import type { Components } from 'react-markdown'

import type { BlockDefinition } from '../types'
import { BlockSlot } from '../render/BlockSlot'

/**
 * Build the react-markdown `components` map that dispatches each registered block
 * tag to its `BlockSlot`. Merged on top of the consumer's standard-element
 * components so normal markdown renders exactly as before.
 */
export function useBlockComponents(
  blocks: readonly BlockDefinition[],
  isStreaming: boolean,
  baseComponents?: Partial<Components>,
): Components {
  return useMemo(() => {
    const map: Record<string, unknown> = { ...(baseComponents ?? {}) }
    for (const def of blocks) {
      map[def.tag] = ({
        node,
        children,
      }: {
        node?: Element
        children?: ReactNode
      }): ReactNode => (
        <BlockSlot def={def} node={node} isStreaming={isStreaming}>
          {children}
        </BlockSlot>
      )
    }
    return map as Components
  }, [blocks, isStreaming, baseComponents])
}

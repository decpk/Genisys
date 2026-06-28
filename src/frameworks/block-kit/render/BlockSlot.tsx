import type { ReactNode } from 'react'
import type { Element } from 'hast'

import type { BlockDefinition } from '../types'
import { readAttrs } from '../parse/readAttrs'
import { BlockErrorBoundary } from './BlockErrorBoundary'

interface BlockSlotProps {
  def: BlockDefinition
  node?: Element
  isStreaming: boolean
  children?: ReactNode
}

/**
 * Bridges a react-markdown component invocation to a registered block's
 * `Renderer`: extracts attrs from the hast node, supplies streaming context, and
 * wraps the result in an error boundary so a malformed block can't crash the doc.
 */
export function BlockSlot({ def, node, isStreaming, children }: BlockSlotProps): ReactNode {
  if (!node) return null
  const { Renderer } = def
  return (
    <BlockErrorBoundary tag={def.tag}>
      <Renderer node={node} attrs={readAttrs(node)} isStreaming={isStreaming}>
        {children}
      </Renderer>
    </BlockErrorBoundary>
  )
}

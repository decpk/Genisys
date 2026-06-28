import { memo } from 'react'

import type { TermNode } from '@/store/terminal-app-store/types'

import { TerminalAppPane } from '../TerminalAppPane/TerminalAppPane'
import { TerminalAppSplit } from '../TerminalAppSplit/TerminalAppSplit'

interface Props {
  node: TermNode
}

/** Recursively renders the split-tree: leaves as panes, splits as resizable rows/cols. */
export const TerminalAppGroup = memo(function TerminalAppGroup({ node }: Props) {
  if (node.kind === 'leaf') return <TerminalAppPane leaf={node} />
  return <TerminalAppSplit node={node} />
})

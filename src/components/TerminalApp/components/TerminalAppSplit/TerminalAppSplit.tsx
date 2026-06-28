import { memo, useCallback, useRef } from 'react'

import { cn } from '@/lib/utils'
import { useTerminalAppStore } from '@/store/terminal-app-store'
import type { TermSplit } from '@/store/terminal-app-store/types'

import { terminalAppStyles } from '../../TerminalApp.styles'
import { TerminalAppGroup } from '../TerminalAppGroup/TerminalAppGroup'

interface Props {
  node: TermSplit
}

/** A split node: two child groups with a draggable divider that persists sizes. */
export const TerminalAppSplit = memo(function TerminalAppSplit({ node }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const setGroupSizes = useTerminalAppStore((s) => s.setGroupSizes)
  const isRow = node.direction === 'horizontal'

  const onDividerDown = useCallback(
    (e: React.PointerEvent) => {
      e.preventDefault()
      const container = containerRef.current
      if (!container) return
      const rect = container.getBoundingClientRect()
      const total = isRow ? rect.width : rect.height
      const start = isRow ? rect.left : rect.top
      if (total <= 0) return

      const onMove = (ev: PointerEvent) => {
        const pos = isRow ? ev.clientX : ev.clientY
        const ratio = Math.max(0.1, Math.min(0.9, (pos - start) / total))
        setGroupSizes(node.id, [ratio, 1 - ratio])
      }
      const onUp = () => {
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
      }
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    },
    [isRow, node.id, setGroupSizes],
  )

  const onDividerDoubleClick = useCallback(() => {
    setGroupSizes(node.id, [0.5, 0.5])
  }, [node.id, setGroupSizes])

  return (
    <div
      ref={containerRef}
      className={cn(
        terminalAppStyles.split,
        isRow ? terminalAppStyles.splitRow : terminalAppStyles.splitCol,
      )}
    >
      <div
        className={terminalAppStyles.splitChild}
        style={{ flexGrow: node.sizes[0], flexShrink: 1, flexBasis: 0 }}
      >
        <TerminalAppGroup node={node.children[0]} />
      </div>
      <div
        className={cn(
          terminalAppStyles.divider,
          isRow ? terminalAppStyles.dividerRow : terminalAppStyles.dividerCol,
        )}
        onPointerDown={onDividerDown}
        onDoubleClick={onDividerDoubleClick}
        title="Double-click to split evenly"
        role="separator"
        aria-orientation={isRow ? 'vertical' : 'horizontal'}
      />
      <div
        className={terminalAppStyles.splitChild}
        style={{ flexGrow: node.sizes[1], flexShrink: 1, flexBasis: 0 }}
      >
        <TerminalAppGroup node={node.children[1]} />
      </div>
    </div>
  )
})

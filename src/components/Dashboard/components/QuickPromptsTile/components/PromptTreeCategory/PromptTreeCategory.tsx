import { memo, useState } from 'react'
import { ChevronRight, Layers, Lock } from 'lucide-react'

import type { PmPrompt } from '@/store/prompt-manager-store'

import { PromptTreeLeaf } from '../PromptTreeLeaf'
import type { PromptTreeCategoryNode } from '../../hooks/useGroupedPrompts'

interface PromptTreeCategoryProps {
  node: PromptTreeCategoryNode
  indentPx: number
  childIndentPx: number
  defaultExpanded?: boolean
  onLaunch: (prompt: PmPrompt) => void
}

export const PromptTreeCategory = memo(function PromptTreeCategory(
  props: PromptTreeCategoryProps
): React.JSX.Element {
  const { node, indentPx, childIndentPx, defaultExpanded = false, onLaunch } = props
  const [expanded, setExpanded] = useState(defaultExpanded)

  const handleToggle = (): void => setExpanded((prev) => !prev)

  return (
    <div>
      <button
        type="button"
        onClick={handleToggle}
        style={{ paddingLeft: indentPx }}
        className="w-full flex items-center gap-1.5 pr-2 py-1 rounded text-left hover:bg-secondary/40 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/40"
      >
        <ChevronRight
          size={11}
          className={
            expanded
              ? 'text-muted-foreground/70 rotate-90 transition-transform'
              : 'text-muted-foreground/70 transition-transform'
          }
        />
        <Layers size={12} className="text-sky-500/70 shrink-0" />
        <span className="text-[12px] text-foreground truncate flex-1 min-w-0">
          {node.category.name}
        </span>
        {node.category.isBuiltIn && (
          <Lock size={9} className="text-muted-foreground/60 shrink-0" />
        )}
        <span className="text-[10px] text-muted-foreground/70 tabular-nums shrink-0">
          {node.prompts.length}
        </span>
      </button>
      {expanded && (
        <div className="border-l border-border/20 flex flex-col" style={{ marginLeft: indentPx + 6 }}>
          {node.prompts.length === 0 ? (
            <div
              className="text-[11px] text-muted-foreground/60 italic py-1"
              style={{ paddingLeft: childIndentPx }}
            >
              No prompts
            </div>
          ) : (
            node.prompts.map((prompt) => (
              <PromptTreeLeaf
                key={prompt.id}
                prompt={prompt}
                indentPx={childIndentPx}
                onLaunch={onLaunch}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
})

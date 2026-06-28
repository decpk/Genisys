import { memo, useState } from 'react'
import { ChevronRight, Folder, FolderOpen, Lock } from 'lucide-react'

import type { PmPrompt } from '@/store/prompt-manager-store'

import { PromptTreeCategory } from '../PromptTreeCategory'
import type { PromptTreeFolderNode } from '../../hooks/useGroupedPrompts'

interface PromptTreeFolderProps {
  node: PromptTreeFolderNode
  defaultExpanded?: boolean
  onLaunch: (prompt: PmPrompt) => void
}

const FOLDER_INDENT = 8
const CATEGORY_INDENT = 22
const PROMPT_INDENT = 36

export const PromptTreeFolder = memo(function PromptTreeFolder(
  props: PromptTreeFolderProps
): React.JSX.Element {
  const { node, defaultExpanded = false, onLaunch } = props
  const [expanded, setExpanded] = useState(defaultExpanded)
  const FolderIcon = expanded ? FolderOpen : Folder

  const handleToggle = (): void => setExpanded((prev) => !prev)

  return (
    <div>
      <button
        type="button"
        onClick={handleToggle}
        style={{ paddingLeft: FOLDER_INDENT }}
        className="w-full flex items-center gap-1.5 pr-2 py-1 rounded text-left hover:bg-secondary/40 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-primary/40"
      >
        <ChevronRight
          size={12}
          className={
            expanded
              ? 'text-muted-foreground/70 rotate-90 transition-transform'
              : 'text-muted-foreground/70 transition-transform'
          }
        />
        <FolderIcon
          size={13}
          className="shrink-0"
          style={{ color: node.folder.color || undefined }}
        />
        <span className="text-[12px] font-medium text-foreground truncate flex-1 min-w-0">
          {node.folder.name}
        </span>
        {node.folder.isBuiltIn && (
          <Lock size={9} className="text-muted-foreground/60 shrink-0" />
        )}
        <span className="text-[10px] text-muted-foreground/70 tabular-nums shrink-0">
          {node.totalPrompts}
        </span>
      </button>
      {expanded && (
        <div className="flex flex-col">
          {node.categories.length === 0 ? (
            <div
              className="text-[11px] text-muted-foreground/60 italic py-1"
              style={{ paddingLeft: CATEGORY_INDENT }}
            >
              No categories
            </div>
          ) : (
            node.categories.map((cat) => (
              <PromptTreeCategory
                key={cat.category.id}
                node={cat}
                indentPx={CATEGORY_INDENT}
                childIndentPx={PROMPT_INDENT}
                onLaunch={onLaunch}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
})

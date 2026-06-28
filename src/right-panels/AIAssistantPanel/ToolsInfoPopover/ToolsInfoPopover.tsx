import { Info } from 'lucide-react'

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { Tooltip } from '@/components/Tooltip'

import type { ToolsInfoPopoverProps } from './ToolsInfoPopover.types'
import { toolsPopoverStyles as styles } from './ToolsInfoPopover.styles'
import { groupToolsByCategory } from './utils/groupToolsByCategory'
import { formatToolName } from './utils/formatToolName'

export function ToolsInfoPopover({ tools }: ToolsInfoPopoverProps): React.JSX.Element {
  const grouped = groupToolsByCategory(tools)

  return (
    <Popover>
      <Tooltip content="Available tools" side="top">
        <PopoverTrigger asChild>
          <button type="button" className={styles.trigger}>
            <Info size={12} />
          </button>
        </PopoverTrigger>
      </Tooltip>
      <PopoverContent side="top" align="end" className={styles.content}>
        <div className={styles.header}>
          <span className={styles.headerTitle}>
            Available Tools
          </span>
          <span className={styles.headerCount}>
            ({tools.length})
          </span>
        </div>
        {[...grouped.entries()].map(([category, categoryTools]) => (
          <div key={category} className={styles.categorySection}>
            <div className={styles.categoryLabel}>{category}</div>
            {categoryTools.map((tool) => (
              <div key={tool.name} className={styles.toolItem}>
                <span className={styles.toolName}>
                  {formatToolName(tool.name)}
                </span>
                <span className={styles.toolDescription}>
                  {tool.description}
                </span>
              </div>
            ))}
          </div>
        ))}
      </PopoverContent>
    </Popover>
  )
}

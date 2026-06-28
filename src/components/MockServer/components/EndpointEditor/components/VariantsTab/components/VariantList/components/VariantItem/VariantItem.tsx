import { Copy, ChevronDown, ChevronRight, Trash2 } from 'lucide-react'
import { Collapsible as CollapsiblePrimitive } from 'radix-ui'

import { Tooltip } from '@/components/Tooltip'
import { cn } from '@/lib/utils'

import { useVariantItemData } from './useVariantItemData'
import { VariantItemDetails } from './components/VariantItemDetails'
import { getStatusColorClass } from './utils/getStatusColorClass'
import type { VariantItemProps } from './VariantItem.types'
import { variantItemStyles as styles } from './VariantItem.styles'

export function VariantItem(props: VariantItemProps) {
  const { variant, mode, onDuplicate, onDelete, onUpdate } = props
  const d = useVariantItemData(variant, onUpdate)

  const badgeClass = cn(styles.badge, getStatusColorClass(d.statusCode))
  const ChevronIcon = d.expanded ? ChevronDown : ChevronRight

  return (
    <CollapsiblePrimitive.Root
      open={d.expanded}
      onOpenChange={d.setExpanded}
      className={styles.root}
    >
      <div className={styles.row}>
        <Tooltip content={d.expanded ? 'Collapse variant details' : 'Expand variant details'} side="top">
          <CollapsiblePrimitive.Trigger type="button" className={styles.chevron}>
            <ChevronIcon className="h-3.5 w-3.5" />
          </CollapsiblePrimitive.Trigger>
        </Tooltip>
        <input
          value={d.name}
          onChange={(e) => d.handleNameChange(e.target.value)}
          onBlur={d.persistName}
          placeholder="Variant name"
          className={styles.nameInput}
        />
        <span className={badgeClass}>{d.statusCode}</span>
        <input
          type="number"
          value={d.statusCode}
          onChange={(e) => d.handleStatusChange(Number(e.target.value) || 0)}
          onBlur={d.persistStatus}
          className={styles.statusInput}
        />
        <Tooltip content="Duplicate this variant" side="top">
          <button
            type="button"
            onClick={() => onDuplicate(variant.id)}
            className={styles.duplicateBtn}
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </Tooltip>
        <Tooltip content="Delete this variant" side="top">
          <button
            type="button"
            onClick={() => onDelete(variant.id)}
            className={styles.deleteBtn}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </Tooltip>
      </div>
      <CollapsiblePrimitive.Content className={styles.content}>
        <VariantItemDetails
          mode={mode}
          body={d.body}
          onBodyChange={d.handleBodyChange}
          weight={d.weight}
          onWeightChange={d.handleWeightChange}
          onWeightBlur={d.persistWeight}
          matchRules={variant.match_rules}
          onMatchRulesChange={d.handleMatchRulesChange}
        />
      </CollapsiblePrimitive.Content>
    </CollapsiblePrimitive.Root>
  )
}

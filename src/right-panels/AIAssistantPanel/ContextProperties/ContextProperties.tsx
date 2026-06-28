import { memo } from 'react'
import { X } from 'lucide-react'

import { Tooltip } from '@/components/Tooltip'
import { contextStyles as styles } from '../AIAssistantPanel.styles'
import type { ContextPropertiesProps } from './ContextProperties.types'

export const ContextProperties = memo(function ContextProperties({
  items,
  label,
}: ContextPropertiesProps): React.JSX.Element | null {
  if (items.length === 0) return null

  return (
    <div className={styles.root}>
      {label && <span className={styles.label}>{label}</span>}
      {items.map((item) => {
        const Icon = item.icon
        const tooltip = item.sublabel ?? item.label
        const isInteractive = Boolean(item.onClick)

        const chipInner = (
          <>
            {Icon && <Icon size={10} className={styles.chipIcon} />}
            <span className={styles.chipLabel}>{item.label}</span>
            {item.onRemove && (
              <Tooltip content="Remove" side="top">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    item.onRemove?.()
                  }}
                  className={styles.removeButton}
                  aria-label="Remove"
                >
                  <X size={8} />
                </button>
              </Tooltip>
            )}
          </>
        )

        return isInteractive ? (
          <Tooltip key={item.id} content={tooltip} side="top">
            <button
              type="button"
              onClick={item.onClick}
              className={styles.chip}
            >
              {chipInner}
            </button>
          </Tooltip>
        ) : (
          <Tooltip key={item.id} content={tooltip} side="top">
            <div className={styles.chipNonInteractive}>{chipInner}</div>
          </Tooltip>
        )
      })}
    </div>
  )
})

import { memo } from 'react'
import { Bookmark } from 'lucide-react'

import {
  activeIndicatorStyles,
  badgeStyles,
  separatorStyles,
  tocItemStyles,
  treeGuideStyles,
} from '../TocPanel.styles'
import type { TocItemProps } from './TocItem.types'

function TocItemComponent(props: TocItemProps): React.JSX.Element {
  const { item, isActive, showSeparator, activeItemRef, onNavigate } = props

  const isPrimary = item.level === 'primary'
  const isNested = item.level === 'secondary' || item.level === 'tertiary'

  let sizeClass: string = tocItemStyles.tertiary
  if (isPrimary) sizeClass = tocItemStyles.primary
  else if (item.level === 'secondary') sizeClass = tocItemStyles.secondary

  let colorClass: string = tocItemStyles.nestedIdle
  if (isActive) colorClass = tocItemStyles.activeState
  else if (isPrimary) colorClass = tocItemStyles.primaryIdle

  const buttonClass = `${tocItemStyles.base} ${sizeClass} ${colorClass}`
  const iconSize = isPrimary ? 12 : 10
  const labelClass = `flex-1 min-w-0 truncate leading-tight ${isPrimary ? 'font-medium' : ''}`

  const guideClass = isActive ? treeGuideStyles.active : treeGuideStyles.idle
  const showGuide = isNested

  const badgeClass = isActive ? badgeStyles.active : badgeStyles.idle

  const Icon = item.icon
  const iconColor = isActive ? 'text-primary' : (item.iconColor ?? 'text-muted-foreground/60')

  return (
    <div>
      {showSeparator && <div className={separatorStyles} />}
      <button
        ref={isActive ? activeItemRef : undefined}
        onClick={() => onNavigate(item.id)}
        className={buttonClass}
      >
        {isActive && <span className={activeIndicatorStyles} />}
        {showGuide && <span className={guideClass} />}

        {Icon && <Icon size={iconSize} className={`shrink-0 ${iconColor}`} />}

        <span className={labelClass}>{item.label}</span>

        {item.isBookmarked && (
          <Bookmark
            size={isPrimary ? 11 : 9}
            fill="currentColor"
            className="shrink-0 text-primary ml-auto"
            aria-label="Bookmarked"
          />
        )}

        {item.badge && <span className={badgeClass}>{item.badge}</span>}
      </button>
    </div>
  )
}

export const TocItem = memo(TocItemComponent)

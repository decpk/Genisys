import { memo } from 'react'
import { Tooltip } from '@/components/Tooltip'
import type { SmartCollectionKey } from '../../../../utils/smart-collections'
import { formatCategoryTooltip } from './utils/formatCategoryTooltip'
import type { TimelineCategoryBarProps } from './TimelineCategoryBar.types'
import { CATEGORY_BAR_ROOT, CATEGORY_BAR_SEGMENT, CATEGORY_BAR_LABEL } from './TimelineCategoryBar.styles'

const CATEGORY_COLORS: Record<SmartCollectionKey, string> = {
  url: 'bg-blue-400',
  code: 'bg-emerald-400',
  color: 'bg-pink-400',
  email: 'bg-amber-400',
  json: 'bg-violet-400',
  shell: 'bg-orange-400',
  filepath: 'bg-cyan-400',
  phone: 'bg-teal-400',
}

const CATEGORY_SHORT_LABELS: Record<SmartCollectionKey, string> = {
  url: 'urls',
  code: 'code',
  color: 'colors',
  email: 'email',
  json: 'json',
  shell: 'shell',
  filepath: 'files',
  phone: 'phone',
}

export const TimelineCategoryBar = memo(function TimelineCategoryBar(props: TimelineCategoryBarProps): React.JSX.Element {
  const { breakdown } = props
  const { categories, imageCount, total } = breakdown

  if (total === 0) return <div />

  const segments: Array<{ color: string; width: number; label: string; count: number }> = []

  for (const cat of categories) {
    const pct = Math.max(5, (cat.count / total) * 100)
    segments.push({
      color: CATEGORY_COLORS[cat.key] ?? 'bg-muted',
      width: pct,
      label: CATEGORY_SHORT_LABELS[cat.key] ?? cat.key,
      count: cat.count,
    })
  }

  if (imageCount > 0) {
    const pct = Math.max(5, (imageCount / total) * 100)
    segments.push({ color: 'bg-purple-400', width: pct, label: 'images', count: imageCount })
  }

  const topLabel = segments.length > 0 ? segments[0].label : ''

  return (
    <div className={CATEGORY_BAR_ROOT}>
      {segments.map((seg, i) => {
        const tooltipText = formatCategoryTooltip(seg.label, seg.count, total)
        return (
          <Tooltip key={i} content={tooltipText} side="top" delayMs={120}>
            <div
              className={`${CATEGORY_BAR_SEGMENT} ${seg.color}`}
              style={{ width: `${seg.width}%` }}
            />
          </Tooltip>
        )
      })}
      <span className={CATEGORY_BAR_LABEL}>{topLabel}</span>
    </div>
  )
})

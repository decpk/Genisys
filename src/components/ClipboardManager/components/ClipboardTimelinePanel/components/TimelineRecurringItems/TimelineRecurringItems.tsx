import { memo, useState, useCallback } from 'react'
import { Repeat2, Copy, Pin, Lightbulb } from 'lucide-react'
import { scopedToast } from '@/frameworks/notification'

const toast = scopedToast('clipboard')
import { AppInlineLoader } from '@/components/AppLoader'
import { useClipboardStore } from '@/store/clipboard-store'
import type { TimelineRecurringItemsProps } from './TimelineRecurringItems.types'
import type { RecurringItem } from '../../../../utils/timeline-insights/recurring'
import {
  RECURRING_ROOT, RECURRING_HEADER, RECURRING_HEADER_LEFT,
  RECURRING_HEADER_ICON, RECURRING_HEADER_TITLE, RECURRING_COUNT_BADGE,
  RECURRING_TIP, RECURRING_TIP_ICON,
  RECURRING_LIST, RECURRING_ITEM, RECURRING_ITEM_PREVIEW,
  RECURRING_ITEM_COUNT,
  RECURRING_ITEM_PIN_BUTTON, RECURRING_ITEM_PINNED_BADGE,
  RECURRING_EMPTY, RECURRING_LOADER,
} from './TimelineRecurringItems.styles'

export const TimelineRecurringItems = memo(function TimelineRecurringItems(props: TimelineRecurringItemsProps): React.JSX.Element {
  const { items, loading } = props

  if (loading) {
    return (
      <div className={RECURRING_ROOT}>
        <div className={RECURRING_HEADER}>
          <div className={RECURRING_HEADER_LEFT}>
            <Repeat2 className={RECURRING_HEADER_ICON} />
            <span className={RECURRING_HEADER_TITLE}>Recurring Content</span>
          </div>
        </div>
        <div className={RECURRING_LOADER}>
          <AppInlineLoader message="Analyzing patterns…" />
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className={RECURRING_ROOT}>
        <div className={RECURRING_HEADER}>
          <div className={RECURRING_HEADER_LEFT}>
            <Repeat2 className={RECURRING_HEADER_ICON} />
            <span className={RECURRING_HEADER_TITLE}>Recurring Content</span>
          </div>
        </div>
        <div className={RECURRING_EMPTY}>No repeated content found in recent history</div>
      </div>
    )
  }

  return (
    <div className={RECURRING_ROOT}>
      <div className={RECURRING_HEADER}>
        <div className={RECURRING_HEADER_LEFT}>
          <Repeat2 className={RECURRING_HEADER_ICON} />
          <span className={RECURRING_HEADER_TITLE}>Recurring Content</span>
        </div>
        <span className={RECURRING_COUNT_BADGE}>{items.length}</span>
      </div>
      <div className={RECURRING_TIP}>
        <Lightbulb className={RECURRING_TIP_ICON} />
        <span>
          You copy these often — pin them so they stay handy and never get auto-cleared.
        </span>
      </div>
      <div className={RECURRING_LIST}>
        {items.map((item) => (
          <RecurringRow key={item.contentHash} item={item} />
        ))}
      </div>
    </div>
  )
})

interface RecurringRowProps {
  item: RecurringItem
}

const RecurringRow = memo(function RecurringRow(props: RecurringRowProps): React.JSX.Element {
  const { item } = props
  const togglePin = useClipboardStore((s) => s.togglePin)
  const [pinning, setPinning] = useState(false)
  const [optimisticPinned, setOptimisticPinned] = useState<boolean | null>(null)

  const isPinned = optimisticPinned ?? item.isPinned

  const handlePin = useCallback(async () => {
    if (pinning) return
    setPinning(true)
    setOptimisticPinned(true)
    try {
      const next = await togglePin(item.itemId)
      setOptimisticPinned(next)
      toast.success(next ? 'Pinned to clipboard' : 'Unpinned')
    } catch {
      setOptimisticPinned(item.isPinned)
      toast.error('Failed to pin')
    } finally {
      setPinning(false)
    }
  }, [pinning, togglePin, item.itemId, item.isPinned])

  return (
    <div className={RECURRING_ITEM}>
      <span className={RECURRING_ITEM_PREVIEW}>{item.preview}</span>
      <div className="flex items-center gap-2 shrink-0">
        <span className={RECURRING_ITEM_COUNT}>
          <Copy className="size-2.5" />
          {item.count}×
        </span>
        {isPinned ? (
          <span className={RECURRING_ITEM_PINNED_BADGE}>
            <Pin className="size-2.5" fill="currentColor" />
            Pinned
          </span>
        ) : (
          <button
            type="button"
            onClick={handlePin}
            disabled={pinning}
            className={RECURRING_ITEM_PIN_BUTTON}
            aria-label="Pin recurring item"
          >
            <Pin className="size-2.5" />
            Pin
          </button>
        )}
      </div>
    </div>
  )
})

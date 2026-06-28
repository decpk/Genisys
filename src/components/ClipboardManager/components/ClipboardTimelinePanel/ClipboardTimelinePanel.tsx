import { useMemo } from 'react'
import { ChevronLeft, ChevronRight, CalendarX2, FileText, ImageIcon, Clock } from 'lucide-react'
import { DatePicker } from '@/components/ui/date-picker'
import { AppInlineLoader } from '@/components/AppLoader'
import { Tooltip } from '@/components/Tooltip'
import { useClipboardTimelineData } from '../../hooks/useClipboardTimelineData'
import { TimelineSessionGroup } from './components/TimelineSessionGroup'
import { TimelineDailyDigest } from './components/TimelineDailyDigest'
import { TimelineHeatmap } from './components/TimelineHeatmap'
import { TimelineRecurringItems } from './components/TimelineRecurringItems'
import { TimelineSortControl } from './components/TimelineSortControl'
import { formatLocalDate } from './utils/formatLocalDate'
import { formatDayLabel } from './utils/formatDayLabel'
import { parseLocalDateString } from './utils/parseLocalDateString'
import {
  TIMELINE_PANEL_ROOT,
  TIMELINE_HEADER_CARD,
  TIMELINE_HEADER_DIVIDER,
  TIMELINE_DATE_HEADER,
  TIMELINE_NAV_BUTTON,
  TIMELINE_DATE_LABEL,
  TIMELINE_STATS,
  TIMELINE_STAT_ITEM,
  TIMELINE_STAT_VALUE,
  TIMELINE_SCROLL_AREA,
  TIMELINE_EMPTY,
  TIMELINE_EMPTY_ICON,
  TIMELINE_EMPTY_TEXT,
  TIMELINE_EMPTY_SUB,
  TIMELINE_LOADER,
} from './ClipboardTimelinePanel.styles'

export function ClipboardTimelinePanel(): React.JSX.Element {
  const {
    date,
    items,
    loading,
    setDate,
    goToPrevDay,
    goToNextDay,
    isToday,
    sessions,
    digest,
    digestSummary,
    securityAlerts,
    categoryBreakdowns,
    heatmap,
    recurringItems,
    multiDayLoading,
    sortDirection,
    setSortDirection,
  } = useClipboardTimelineData()

  const dateValue = useMemo(() => parseLocalDateString(date), [date])

  const handleDateChange = (d: Date | undefined) => {
    if (!d) return
    setDate(formatLocalDate(d))
  }

  const textCount = useMemo(() => items.filter((i) => i.contentType === 'text').length, [items])
  const imageCount = useMemo(() => items.filter((i) => i.contentType === 'image').length, [items])

  const dayLabel = formatDayLabel(date)
  const hasItems = items.length > 0
  const showEmpty = !loading && !hasItems
  const showContent = !loading && hasItems

  const statsContent = showContent ? (
    <>
      <div className={TIMELINE_HEADER_DIVIDER} />
      <div className={TIMELINE_STATS}>
        <div className={TIMELINE_STAT_ITEM}>
          <Clock size={11} />
          <span className={TIMELINE_STAT_VALUE}>{items.length}</span>
          total
        </div>
        <div className={TIMELINE_STAT_ITEM}>
          <FileText size={11} />
          <span className={TIMELINE_STAT_VALUE}>{textCount}</span>
          text
        </div>
        <div className={TIMELINE_STAT_ITEM}>
          <ImageIcon size={11} />
          <span className={TIMELINE_STAT_VALUE}>{imageCount}</span>
          images
        </div>
        <div className="ml-auto flex items-center">
          <TimelineSortControl
            value={sortDirection}
            onChange={setSortDirection}
          />
        </div>
      </div>
    </>
  ) : null

  const digestContent = showContent ? (
    <>
      <div className={TIMELINE_HEADER_DIVIDER} />
      <TimelineDailyDigest digest={digest} summary={digestSummary} />
    </>
  ) : null

  const loadingContent = loading ? (
    <div className={TIMELINE_LOADER}>
      <AppInlineLoader message="Loading timeline…" />
    </div>
  ) : null

  const emptyContent = showEmpty ? (
    <div className={TIMELINE_EMPTY}>
      <CalendarX2 className={TIMELINE_EMPTY_ICON} />
      <span className={TIMELINE_EMPTY_TEXT}>No activity</span>
      <span className={TIMELINE_EMPTY_SUB}>
        Nothing was copied to your clipboard on this date
      </span>
    </div>
  ) : null

  const sessionGroups = sessions.map((session) => {
    const breakdown = categoryBreakdowns.get(session.id)
    const sessionAlerts = securityAlerts.filter((a) =>
      session.items.some((item) => item.id === a.itemId)
    )
    return (
      <TimelineSessionGroup
        key={session.id}
        session={session}
        categoryBreakdown={breakdown}
        securityAlerts={sessionAlerts}
      />
    )
  })

  const sessionContent = showContent ? sessionGroups : null

  return (
    <div className={TIMELINE_PANEL_ROOT}>
      <div className={TIMELINE_HEADER_CARD}>
        <div className={TIMELINE_DATE_HEADER}>
          <Tooltip content="Previous day" side="bottom">
            <button className={TIMELINE_NAV_BUTTON} onClick={goToPrevDay} aria-label="Previous day">
              <ChevronLeft className="size-4" />
            </button>
          </Tooltip>
          <div className={TIMELINE_DATE_LABEL}>
            <DatePicker
              value={dateValue}
              onChange={handleDateChange}
              dateFormat="MMM d, yyyy"
              className="h-7 w-full text-xs justify-center"
            />
            <div className="text-[10px] text-muted-foreground/50 text-center mt-0.5 font-medium">
              {dayLabel}
            </div>
          </div>
          <Tooltip content="Next day" side="bottom">
            <button
              className={TIMELINE_NAV_BUTTON}
              onClick={goToNextDay}
              disabled={isToday}
              aria-label="Next day"
            >
              <ChevronRight className="size-4" />
            </button>
          </Tooltip>
        </div>
        {statsContent}
        {digestContent}
      </div>

      {loadingContent}
      {emptyContent}

      <div className={TIMELINE_SCROLL_AREA}>
        <TimelineHeatmap
          cells={heatmap.cells}
          maxCount={heatmap.maxCount}
          loading={multiDayLoading}
        />
        {sessionContent}
        <TimelineRecurringItems items={recurringItems} loading={multiDayLoading} />
      </div>
    </div>
  )
}

import { memo } from 'react'
import { Sparkles, Clock, FileText, ImageIcon, ShieldAlert, Pin, Layers } from 'lucide-react'
import type { TimelineDailyDigestProps } from './TimelineDailyDigest.types'
import {
  DIGEST_ROOT, DIGEST_HEADER, DIGEST_HEADER_ICON, DIGEST_HEADER_TITLE,
  DIGEST_SUMMARY, DIGEST_STATS, DIGEST_STAT_PILL, DIGEST_STAT_VALUE,
} from './TimelineDailyDigest.styles'

function formatPeakHour(hour: number): string {
  const period = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${h12} ${period}`
}

export const TimelineDailyDigest = memo(function TimelineDailyDigest(props: TimelineDailyDigestProps): React.JSX.Element {
  const { digest, summary } = props

  const pills: Array<{ icon: React.ComponentType<{ className?: string }>; value: string | number; label: string }> = [
    { icon: Layers, value: digest.sessionCount, label: digest.sessionCount === 1 ? 'session' : 'sessions' },
    { icon: Clock, value: formatPeakHour(digest.peakHour), label: 'peak' },
    { icon: FileText, value: digest.textCount, label: 'text' },
    { icon: ImageIcon, value: digest.imageCount, label: 'images' },
  ]

  if (digest.sensitiveCount > 0) {
    pills.push({ icon: ShieldAlert, value: digest.sensitiveCount, label: 'sensitive' })
  }
  if (digest.pinnedCount > 0) {
    pills.push({ icon: Pin, value: digest.pinnedCount, label: 'pinned' })
  }

  return (
    <div className={DIGEST_ROOT}>
      <div className={DIGEST_HEADER}>
        <Sparkles className={DIGEST_HEADER_ICON} />
        <span className={DIGEST_HEADER_TITLE}>Daily Digest</span>
      </div>
      <p className={DIGEST_SUMMARY}>{summary}</p>
      <div className={DIGEST_STATS}>
        {pills.map((pill, i) => {
          const Icon = pill.icon
          return (
            <span key={i} className={DIGEST_STAT_PILL}>
              <Icon className="size-2.5" />
              <span className={DIGEST_STAT_VALUE}>{pill.value}</span>
              {pill.label}
            </span>
          )
        })}
      </div>
    </div>
  )
})

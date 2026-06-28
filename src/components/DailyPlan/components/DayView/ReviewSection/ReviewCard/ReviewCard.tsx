import { Clock, ExternalLink, ScanSearch } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'
import { LinkifiedText, LinkRail } from '@/components/LinkifiedText'
import { MarkdownRenderer } from '@/components/ui/markdown-renderer/MarkdownRenderer'
import { ReviewContextMenu, ReviewDropdownMenu } from '../ReviewContextMenu'
import { PriorityDot } from '../../shared/priority'
import { useReviewCardData } from './useReviewCardData'
import { reviewCardStyles as s } from './ReviewCard.styles'
import type { ReviewCardProps } from './ReviewCard.types'

export function ReviewCard(props: ReviewCardProps): React.JSX.Element {
  const { review, onEdit } = props
  const data = useReviewCardData({ review, onEdit })

  const showStatusPill = data.statusLabel !== null && data.statusPillClass !== null
  const showTimeBlock = data.hasTime && data.timeRangeText !== null
  const showDescription = !!review.description
  const showLink = !!review.link
  const cardClass = cn(s.card, data.isCompleted && s.cardCompleted)
  const titleClass = cn(s.cardTitle, data.isCompleted && s.titleCompleted)
  const statusPillClass = cn(s.statusPill, data.statusPillClass ?? undefined)
  const typePillClass = cn(s.typePill, data.reviewTypePillClass)

  return (
    <ReviewContextMenu review={review} onEdit={onEdit}>
      <div onDoubleClick={data.handleDoubleClick} className={cardClass}>
        <div className={s.cardInner}>
          <ReviewDropdownMenu review={review} onEdit={onEdit} className={s.menuButton} />

          <div className={s.cardRow}>
            <Checkbox
              checked={data.isCompleted}
              onCheckedChange={data.handleToggle}
              className="shrink-0 border-foreground/40 hover:border-foreground/60"
            />

            {data.showAuthor && (
              <span className={s.authorGroup}>
                {data.authorAvatarUrl ? (
                  <img
                    src={data.authorAvatarUrl}
                    alt={data.authorName}
                    className={s.authorAvatar}
                  />
                ) : (
                  <span
                    className={cn(
                      s.authorAvatar,
                      'inline-flex items-center justify-center bg-muted text-[10px] font-medium text-muted-foreground',
                    )}
                    aria-hidden
                  >
                    {(data.authorName?.trim()?.charAt(0) || '?').toUpperCase()}
                  </span>
                )}
                <span className={s.authorName}>{data.authorName}</span>
              </span>
            )}

            <p className={titleClass}>
              <LinkifiedText text={review.title} mode="inline" singleLine />
            </p>

            {!data.isCompleted && <PriorityDot visual={data.priorityVisual} />}

            <span className={typePillClass}>{data.reviewTypeLabel}</span>

            {showStatusPill && (
              <span className={statusPillClass}>{data.statusLabel}</span>
            )}

            {data.showAutoReviewerButton && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  data.handleOpenInAutoReviewer()
                }}
                className={s.reviewBtn}
                title="Open in Auto Reviewer"
              >
                <ScanSearch className={s.reviewBtnIcon} />
                <span>Review</span>
              </button>
            )}

            {showLink && (
              <a
                href={review.link}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className={s.timeBlock}
                title={review.link}
              >
                <ExternalLink className={s.timeIcon} />
              </a>
            )}

            {showTimeBlock && (
              <div className={s.timeBlock}>
                <Clock className={s.timeIcon} />
                <span className={s.timeText}>{data.timeRangeText}</span>
                <span className={s.timeDuration}>({data.duration})</span>
              </div>
            )}
          </div>

          {showDescription && data.isPRReview && (
            <div className={s.mdDescription}>
              <MarkdownRenderer content={review.description} variant="compact" />
            </div>
          )}

          {showDescription && !data.isPRReview && (
            <p className={s.cardDescription}>
              <LinkifiedText text={review.description} mode="inline" />
            </p>
          )}

          {showDescription && !data.isPRReview && (
            <LinkRail text={review.description} className={s.linkRail} />
          )}
        </div>
      </div>
    </ReviewContextMenu>
  )
}

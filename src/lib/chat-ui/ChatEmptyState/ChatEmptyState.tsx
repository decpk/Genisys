import { memo, useCallback, useMemo } from 'react'
import { ArrowUpRight, Sparkles } from 'lucide-react'

import { cn } from '@/lib/utils'

import { chatEmptyStateStyles as styles } from './ChatEmptyState.styles'
import type { ChatEmptyStateProps } from './ChatEmptyState.types'
import { normalizeSuggestion } from './utils/normalizeSuggestion'

const DEFAULT_TITLE = 'Ask AI to help you with anything'
const DEFAULT_SUBTITLE = 'Try one of these to get started'

/**
 * Shared welcome / empty state used by the full Chat app and every AI
 * Assistant right-panel surface. Renders a glowing hero badge, title,
 * optional subtitle, and a stack of icon-card suggestion chips.
 */
export const ChatEmptyState = memo(function ChatEmptyState(
  props: ChatEmptyStateProps,
): React.JSX.Element {
  const {
    title = DEFAULT_TITLE,
    subtitle,
    heroIcon,
    suggestions,
    onSuggestionClick,
    className,
  } = props

  const HeroIcon = heroIcon ?? Sparkles
  const items = useMemo(() => (suggestions ?? []).map(normalizeSuggestion), [suggestions])
  const hasSuggestions = items.length > 0

  const handleClick = useCallback(
    (text: string) => {
      onSuggestionClick?.(text)
    },
    [onSuggestionClick],
  )

  let subtitleNode: React.ReactNode = null
  if (hasSuggestions) {
    const subtitleText = subtitle ?? DEFAULT_SUBTITLE
    subtitleNode = <p className={styles.subtitle}>{subtitleText}</p>
  }

  let suggestionsNode: React.ReactNode = null
  if (hasSuggestions) {
    suggestionsNode = (
      <div className={styles.suggestions}>
        {items.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.text}
              type="button"
              className={styles.suggestionButton}
              onClick={() => handleClick(item.text)}
            >
              <span className={styles.suggestionIconWrap}>
                <Icon size={14} />
              </span>
              <span className={styles.suggestionLabel}>{item.text}</span>
              <ArrowUpRight size={14} className={styles.suggestionArrow} />
            </button>
          )
        })}
      </div>
    )
  }

  return (
    <div className={cn(styles.root, className)}>
      <div className={styles.heroBadge}>
        <HeroIcon size={20} className={styles.heroIcon} />
      </div>
      <div className={styles.body}>
        <p className={styles.title}>{title}</p>
        {subtitleNode}
        {suggestionsNode}
      </div>
    </div>
  )
})

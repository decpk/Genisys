import { Check } from 'lucide-react'

import type { ThemeCardProps } from './ThemeCard.types'
import { THEME_CARD_STYLES } from './ThemeCard.styles'
import { buildCardContainerStyle } from './utils/buildCardContainerStyle'

export function ThemeCard(props: ThemeCardProps): React.JSX.Element {
  const { theme, isActive, onSelect } = props
  const { colors } = theme
  const { background, foreground, card, primary, secondary, accent } = colors
  const mutedForeground = colors['muted-foreground']
  const primaryForeground = colors['primary-foreground']
  const sidebarColor = colors.sidebar ?? card

  const containerStyle = buildCardContainerStyle(colors, isActive)

  const handleClick = () => {
    onSelect(theme.id)
  }

  return (
    <div className={THEME_CARD_STYLES.container} style={containerStyle}>
      <button
        onClick={handleClick}
        className={THEME_CARD_STYLES.button}
        style={{ borderRadius: '16px' }}
      >
        {/* Mini app-window preview */}
        <div className={THEME_CARD_STYLES.preview} style={{ backgroundColor: background }}>
          {/* Title bar with theme-colored window dots */}
          <div
            className={THEME_CARD_STYLES.titleBar}
            style={{ height: 16, backgroundColor: card }}
          >
            <span className={THEME_CARD_STYLES.trafficDot} style={{ backgroundColor: primary }} />
            <span
              className={THEME_CARD_STYLES.trafficDot}
              style={{ backgroundColor: secondary }}
            />
            <span className={THEME_CARD_STYLES.trafficDot} style={{ backgroundColor: accent }} />
          </div>

          {/* Body: sidebar + content lines */}
          <div className={THEME_CARD_STYLES.body} style={{ height: 62 }}>
            <div
              className={THEME_CARD_STYLES.sidebar}
              style={{ width: '26%', backgroundColor: sidebarColor }}
            />
            <div className={THEME_CARD_STYLES.content}>
              <span
                className={THEME_CARD_STYLES.line}
                style={{ width: '70%', height: 4, backgroundColor: foreground, opacity: 0.85 }}
              />
              <span
                className={THEME_CARD_STYLES.line}
                style={{ width: '45%', height: 4, backgroundColor: mutedForeground }}
              />
              <span
                className={THEME_CARD_STYLES.pill}
                style={{ width: 26, height: 8, backgroundColor: primary }}
              />
            </div>
          </div>

          {isActive && (
            <div
              className={THEME_CARD_STYLES.checkBadge}
              style={{ backgroundColor: primary }}
            >
              <Check size={10} color={primaryForeground} strokeWidth={3} />
            </div>
          )}
        </div>

        {/* Name row */}
        <div className={THEME_CARD_STYLES.nameRow} style={{ backgroundColor: card }}>
          <span className={THEME_CARD_STYLES.nameDot} style={{ backgroundColor: primary }} />
          <span className={THEME_CARD_STYLES.name} style={{ color: foreground }}>
            {theme.name}
          </span>
        </div>
      </button>
    </div>
  )
}

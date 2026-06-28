import { settingsSearchCardStyles as styles } from './SettingsSearchCard.styles'
import type { SettingsSearchCardProps } from './SettingsSearchCard.types'

/**
 * A navigable result card for custom / full-page sections (and notable custom
 * widgets) that can't be filtered row-by-row. Clicking opens that section.
 */
export function SettingsSearchCard(props: SettingsSearchCardProps): React.JSX.Element {
  const { card, onNavigate } = props
  const Icon = card.icon

  const handleClick = () => onNavigate(card.section)

  return (
    <button type="button" onClick={handleClick} className={styles.root}>
      <span className={styles.icon}>
        <Icon size={16} />
      </span>
      <span className={styles.text}>
        <span className={styles.title}>{card.title}</span>
        <span className={styles.description}>{card.description}</span>
      </span>
    </button>
  )
}

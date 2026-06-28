import { findAppEntry } from '@/components/AppStore/data/app-catalog'

import { appHoverDetailsStyles as styles } from './AppHoverDetails.styles'
import type { AppHoverDetailsProps } from './AppHoverDetails.types'

/**
 * In-depth hover card for an ActivityBar app icon. Surfaced by the `Tooltip`'s
 * two-stage expansion after the cursor rests on the icon for a few seconds.
 * Pulls its content (name, tagline, description, accent + version) from the
 * App Store catalog so the popover stays in sync with the store. Renders
 * nothing for apps without a catalog entry (e.g. Settings).
 */
export function AppHoverDetails({ mode }: AppHoverDetailsProps): React.JSX.Element | null {
  const entry = findAppEntry(mode)
  if (!entry) return null

  const Icon = entry.icon

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <span
          className={styles.iconWrap}
          style={{ backgroundColor: `${entry.accentColor}1f`, color: entry.accentColor }}
        >
          <Icon size={18} />
        </span>
        <div className={styles.headingText}>
          <span className={styles.name}>{entry.name}</span>
          <span className={styles.version}>v{entry.version}</span>
        </div>
      </div>
      <p className={styles.tagline}>{entry.tagline}</p>
      <p className={styles.description}>{entry.description}</p>
    </div>
  )
}

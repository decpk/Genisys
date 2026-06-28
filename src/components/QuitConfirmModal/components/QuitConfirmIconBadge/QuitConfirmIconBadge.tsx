import { Power } from 'lucide-react'

import { quitConfirmIconBadgeStyles as styles } from './QuitConfirmIconBadge.styles'

export function QuitConfirmIconBadge(): React.JSX.Element {
  return (
    <div className={styles.wrapper}>
      <div className={styles.badge}>
        <span className={styles.badgeHalo} aria-hidden="true" />
        <Power className={styles.icon} />
      </div>
    </div>
  )
}

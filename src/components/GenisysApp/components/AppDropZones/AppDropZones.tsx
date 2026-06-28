import { Ban, ExternalLink } from 'lucide-react'

import { cn } from '@/lib/utils'

import { appDropZonesStyles as styles } from './AppDropZones.styles'
import { useAppDropZonesData } from './useAppDropZonesData'

/**
 * Drop overlay shown over the main content while an app icon is dragged out of
 * the ActivityBar. The area is sliced into two stacked zones:
 *
 *  - TOP    → release to open the app in a new window
 *  - BOTTOM → release to disable the app (removed from the ActivityBar)
 *
 * Purely presentational and `pointer-events-none`: the actual drop decision is
 * made geometrically by the ActivityBar drag handlers (`useActivityBarData`),
 * which also drive the shared `app-drag-store` this component reads. It only
 * renders once the pointer has entered the content area during a drag.
 */
export function AppDropZones(): React.JSX.Element | null {
  const { draggingApp, pointerZone, draggedItem } = useAppDropZonesData()

  if (!draggingApp || !pointerZone) return null

  const DraggedIcon = draggedItem?.icon
  const appLabel = draggedItem?.label ?? draggingApp

  return (
    <div className={styles.overlay} aria-hidden>
      <div
        className={cn(
          styles.zone,
          pointerZone === 'window' ? styles.windowActive : styles.windowIdle,
        )}
      >
        <div className={cn(styles.iconWrap, styles.windowIconWrap)}>
          <ExternalLink size={22} strokeWidth={2} />
        </div>
        <span className={styles.label}>Open in new window</span>
        <span className={styles.sublabel}>
          {DraggedIcon ? <DraggedIcon size={13} strokeWidth={2} /> : null}
          {appLabel}
        </span>
      </div>

      <div
        className={cn(
          styles.zone,
          pointerZone === 'disable' ? styles.disableActive : styles.disableIdle,
        )}
      >
        <div className={cn(styles.iconWrap, styles.disableIconWrap)}>
          <Ban size={22} strokeWidth={2} />
        </div>
        <span className={styles.label}>Disable app</span>
        <span className={styles.sublabel}>Remove {appLabel} from the sidebar</span>
      </div>
    </div>
  )
}

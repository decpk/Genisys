import { memo } from 'react'
import { AlertTriangle, ShieldAlert } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { confirmationPanelStyles as styles } from './ConfirmationPanel.styles'
import { ConfirmationItem } from './ConfirmationItem'
import type { ConfirmationPanelProps } from './ConfirmationPanel.types'

/**
 * Modern amber-tinted confirmation card shown when the AI requests approval
 * for a destructive or otherwise sensitive action. Glowing icon badge,
 * gradient surface, file/action chips with contextual icons, and a gradient
 * confirm button.
 */
export const ConfirmationPanel = memo(function ConfirmationPanel(
  props: ConfirmationPanelProps,
): React.JSX.Element {
  const { confirm, onConfirm, onCancel } = props
  const hasItems = confirm.items.length > 0

  let itemsNode: React.ReactNode = null
  if (hasItems) {
    itemsNode = (
      <div className={styles.itemsContainer}>
        {confirm.items.map((item, i) => (
          <ConfirmationItem key={`${item.path}-${i}`} item={item} />
        ))}
      </div>
    )
  }

  let warningNode: React.ReactNode = null
  if (confirm.warning) {
    warningNode = (
      <p className={styles.warning}>
        <ShieldAlert size={11} className={styles.warningIcon} />
        <span>{confirm.warning}</span>
      </p>
    )
  }

  return (
    <div className={styles.root} role="alertdialog" aria-live="polite">
      <div className={styles.header}>
        <span className={styles.iconBadge}>
          <AlertTriangle size={14} className={styles.iconBadgeIcon} />
        </span>
        <div className={styles.headerText}>
          <span className={styles.eyebrow}>Confirmation required</span>
          <span className={styles.title}>{confirm.action}</span>
        </div>
      </div>

      <div className={styles.body}>
        <p className={styles.description}>{confirm.description}</p>
        {itemsNode}
        {warningNode}
      </div>

      <div className={styles.footer}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className={styles.cancelButton}
        >
          Cancel
        </Button>
        <Button
          type="button"
          size="sm"
          onClick={onConfirm}
          className={styles.confirmButton}
        >
          <AlertTriangle size={11} />
          Confirm
        </Button>
      </div>
    </div>
  )
})

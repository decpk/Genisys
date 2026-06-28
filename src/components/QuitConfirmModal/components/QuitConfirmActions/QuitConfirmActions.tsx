import { Power } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { QuitConfirmActionsProps } from './QuitConfirmActions.types'
import { quitConfirmActionsStyles as styles } from './QuitConfirmActions.styles'

export function QuitConfirmActions(props: QuitConfirmActionsProps): React.JSX.Element {
  const { confirmLabel, cancelLabel, onConfirm, onCancel } = props
  return (
    <div className={styles.root}>
      <div className={styles.wrapper}>
        <Button
          variant="outline"
          onClick={onCancel}
          className={styles.cancel}
          autoFocus
        >
          {cancelLabel}
        </Button>
        <Button
          variant="destructive"
          onClick={onConfirm}
          className={styles.confirm}
        >
          <Power className={styles.confirmIcon} aria-hidden="true" />
          {confirmLabel}
        </Button>
      </div>
      <div className={styles.hints} aria-hidden="true">
        <span className={styles.hintGroup}>
          <kbd className={styles.kbd}>Esc</kbd>
          <span>to cancel</span>
        </span>
        <span className={styles.hintDivider} />
        <span className={styles.hintGroup}>
          <kbd className={styles.kbd}>⌘</kbd>
          <kbd className={styles.kbd}>Q</kbd>
          <span>to quit</span>
        </span>
      </div>
    </div>
  )
}

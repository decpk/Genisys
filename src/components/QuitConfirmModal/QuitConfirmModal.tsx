import { Dialog as DialogPrimitive } from 'radix-ui'

import { QuitConfirmActions } from './components/QuitConfirmActions'
import { QuitConfirmAmbientBlobs } from './components/QuitConfirmAmbientBlobs'
import { QuitConfirmHeader } from './components/QuitConfirmHeader'
import { QuitConfirmIconBadge } from './components/QuitConfirmIconBadge'
import { QuitConfirmStayPanel } from './components/QuitConfirmStayPanel'
import {
  QUIT_CONFIRM_CANCEL_LABEL,
  QUIT_CONFIRM_CONFIRM_LABEL,
  QUIT_CONFIRM_DESCRIPTION,
  QUIT_CONFIRM_EYEBROW,
  QUIT_CONFIRM_TITLE,
} from './QuitConfirmModal.constants'
import { quitConfirmModalStyles as styles } from './QuitConfirmModal.styles'
import { useQuitConfirmModalData } from './hooks/useQuitConfirmModalData'

export function QuitConfirmModal(): React.JSX.Element {
  const { isOpen, handleConfirm, handleCancel, handleOpenChange } = useQuitConfirmModalData()

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className={styles.overlay} />
        <QuitConfirmAmbientBlobs />
        <DialogPrimitive.Content
          className={styles.contentWrapper}
          onContextMenu={(e) => e.preventDefault()}
        >
          <div className={styles.card}>
            <div className={styles.leftPane}>
              <div className={styles.leftPaneGlow} aria-hidden="true" />
              <div className="relative flex flex-col gap-6">
                <QuitConfirmIconBadge />
                <QuitConfirmHeader
                  eyebrow={QUIT_CONFIRM_EYEBROW}
                  title={QUIT_CONFIRM_TITLE}
                  description={QUIT_CONFIRM_DESCRIPTION}
                />
              </div>
              <div className="relative">
                <QuitConfirmActions
                  confirmLabel={QUIT_CONFIRM_CONFIRM_LABEL}
                  cancelLabel={QUIT_CONFIRM_CANCEL_LABEL}
                  onConfirm={handleConfirm}
                  onCancel={handleCancel}
                />
              </div>
            </div>
            <div className={styles.rightPane}>
              <div className={styles.rightPaneGlow} aria-hidden="true" />
              <div className={styles.rightPaneGlowBottom} aria-hidden="true" />
              <QuitConfirmStayPanel />
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

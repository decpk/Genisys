import { AppLoaderGlyph } from '@/components/AppLoader'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog'

import { useConfirmDialogData } from './useConfirmDialogData'
import { confirmDialogStyles } from './ConfirmDialog.styles'

export function ConfirmDialog(): React.JSX.Element {
  const {
    isOpen,
    isLoading,
    title,
    description,
    confirmLabel,
    cancelLabel,
    variant,
    secondaryActionLabel,
    handleConfirm,
    handleSecondary,
    handleCancel,
    handleOpenChange,
  } = useConfirmDialogData()

  const confirmClassName =
    variant === 'destructive'
      ? confirmDialogStyles.confirmButtonDestructive
      : confirmDialogStyles.confirmButtonDefault

  const hasSecondary = secondaryActionLabel !== null && secondaryActionLabel !== ''
  let secondaryButton: React.ReactNode = null
  if (hasSecondary) {
    secondaryButton = (
      <AlertDialogAction
        onClick={handleSecondary}
        disabled={isLoading}
        className={confirmDialogStyles.secondaryButton}
      >
        {secondaryActionLabel}
      </AlertDialogAction>
    )
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          {secondaryButton}
          <AlertDialogCancel disabled={isLoading} onClick={handleCancel}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className={confirmClassName}
          >
            {isLoading && <AppLoaderGlyph size={16} />}
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

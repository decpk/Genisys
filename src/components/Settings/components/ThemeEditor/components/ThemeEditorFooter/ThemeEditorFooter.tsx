import { Button } from '@/components/ui/button'

import { STYLES } from '../../ThemeEditor.styles'

export interface ThemeEditorFooterProps {
  saveLabel: string
  saveError: string | null
  isSaving: boolean
  isValid: boolean
  onCancel: () => void
  onSave: () => void
}

export function ThemeEditorFooter(props: ThemeEditorFooterProps): React.JSX.Element {
  const { saveLabel, saveError, isSaving, isValid, onCancel, onSave } = props

  let errorNode: React.ReactNode = null
  if (saveError !== null) {
    errorNode = <span className={STYLES.validationError}>{saveError}</span>
  }

  return (
    <footer className={STYLES.footer}>
      {errorNode}
      <Button variant="ghost" size="sm" onClick={onCancel} disabled={isSaving}>
        Cancel
      </Button>
      <Button
        variant="default"
        size="sm"
        onClick={onSave}
        disabled={!isValid || isSaving}
      >
        {saveLabel}
      </Button>
    </footer>
  )
}

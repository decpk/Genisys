import { Button } from '@/components/ui/button'

import type { NewBookDialogFooterProps } from './NewBookDialogFooter.types'

export function NewBookDialogFooter(props: NewBookDialogFooterProps): React.JSX.Element {
  const { createLabel, isCreateDisabled, onCreate, onCancel } = props

  return (
    <div className="flex justify-end gap-2 mt-2">
      <Button variant="outline" size="sm" onClick={onCancel}>
        Cancel
      </Button>
      <Button size="sm" disabled={isCreateDisabled} onClick={onCreate}>
        {createLabel}
      </Button>
    </div>
  )
}

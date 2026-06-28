import { ClipboardCopy } from 'lucide-react'

import { IconButton } from '@/components/ui/icon-button'

import type { RequestLogExportButtonProps } from './RequestLogExportButton.types'
import { requestLogExportButtonStyles } from './RequestLogExportButton.styles'
import { useRequestLogExportButtonData } from './useRequestLogExportButtonData'

export function RequestLogExportButton(props: RequestLogExportButtonProps) {
  const { className } = props
  const { isDisabled, handleExport } = useRequestLogExportButtonData()

  return (
    <IconButton
      variant="ghost"
      size="xs"
      tooltip="Export logs to clipboard"
      className={className}
      disabled={isDisabled}
      onClick={handleExport}
    >
      <ClipboardCopy className={requestLogExportButtonStyles.icon} />
    </IconButton>
  )
}

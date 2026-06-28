import { Bug } from 'lucide-react'

import { IconButton } from '@/components/ui/icon-button'
import { useSettingsStore } from '@/store/settings-store'

interface DebugPanelActionProps {
  tooltipSide: 'top' | 'bottom' | 'left' | 'right'
  onActivate: () => void
}

export function DebugPanelAction({ tooltipSide, onActivate }: DebugPanelActionProps): React.JSX.Element | null {
  const show = useSettingsStore((s) => s.devShowDebugPanel)
  if (!import.meta.env.DEV || !show) return null

  return (
    <IconButton
      tooltip="Debug Panel"
      tooltipSide={tooltipSide}
      size="lg"
      onClick={onActivate}
    >
      <Bug size={20} />
    </IconButton>
  )
}

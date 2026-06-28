import { Activity } from 'lucide-react'

import { IconButton } from '@/components/ui/icon-button'
import { useSettingsStore } from '@/store/settings-store'

interface AIInspectorActionProps {
  tooltipSide: 'top' | 'bottom' | 'left' | 'right'
  onActivate: () => void
}

export function AIInspectorAction({ tooltipSide, onActivate }: AIInspectorActionProps): React.JSX.Element | null {
  const show = useSettingsStore((s) => s.devShowAIInspector)
  if (!import.meta.env.DEV || !show) return null

  return (
    <IconButton
      tooltip="AI Network Inspector"
      tooltipSide={tooltipSide}
      size="lg"
      onClick={onActivate}
    >
      <Activity size={20} />
    </IconButton>
  )
}

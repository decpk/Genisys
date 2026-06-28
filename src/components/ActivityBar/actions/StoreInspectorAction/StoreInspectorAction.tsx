import { DatabaseZap } from 'lucide-react'

import { IconButton } from '@/components/ui/icon-button'
import { useSettingsStore } from '@/store/settings-store'

interface StoreInspectorActionProps {
  tooltipSide: 'top' | 'bottom' | 'left' | 'right'
  onActivate: () => void
}

export function StoreInspectorAction({ tooltipSide, onActivate }: StoreInspectorActionProps): React.JSX.Element | null {
  const show = useSettingsStore((s) => s.devShowStoreInspector)
  if (!import.meta.env.DEV || !show) return null

  return (
    <IconButton
      tooltip="Store Inspector"
      tooltipSide={tooltipSide}
      size="lg"
      onClick={onActivate}
    >
      <DatabaseZap size={20} />
    </IconButton>
  )
}

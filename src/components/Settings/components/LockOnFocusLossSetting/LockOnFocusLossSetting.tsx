import { memo } from 'react'
import { Switch } from '@/components/ui/switch'
import { useSettingsStore } from '@/store/settings-store'
import { SettingRow } from '../SettingRow'

export const LockOnFocusLossSetting = memo(function LockOnFocusLossSetting(): React.JSX.Element {
  const securityEnabled = useSettingsStore((s) => s.securityEnabled)
  const lockOnFocusLoss = useSettingsStore((s) => s.securityLockOnFocusLoss)
  const setLockOnFocusLoss = useSettingsStore((s) => s.setSecurityLockOnFocusLoss)

  if (!securityEnabled) return <></>

  return (
    <SettingRow
      label="Lock on Window Focus Loss"
      description="Automatically lock when you switch to another application or the window loses focus."
    >
      <Switch checked={lockOnFocusLoss} onCheckedChange={setLockOnFocusLoss} />
    </SettingRow>
  )
})

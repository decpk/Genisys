import { memo } from 'react'
import { Switch } from '@/components/ui/switch'
import { useSettingsStore } from '@/store/settings-store'
import { SettingRow } from '../SettingRow'

export const LockOnLaunchSetting = memo(function LockOnLaunchSetting(): React.JSX.Element {
  const securityEnabled = useSettingsStore((s) => s.securityEnabled)
  const lockOnLaunch = useSettingsStore((s) => s.securityLockOnLaunch)
  const setLockOnLaunch = useSettingsStore((s) => s.setSecurityLockOnLaunch)

  if (!securityEnabled) return <></>

  return (
    <SettingRow
      label="Lock on App Launch"
      description="Require your password or PIN every time the app starts."
    >
      <Switch checked={lockOnLaunch} onCheckedChange={setLockOnLaunch} />
    </SettingRow>
  )
})

import { memo } from 'react'
import { LockKeyhole } from 'lucide-react'
import { useSettingsStore } from '@/store/settings-store'
import { useSecurityLockStore } from '@/store/security-lock-store'
import { Button } from '@/components/ui/button'
import { SettingRow } from '../SettingRow'

export const LockNowSetting = memo(function LockNowSetting(): React.JSX.Element {
  const securityEnabled = useSettingsStore((s) => s.securityEnabled)
  const lock = useSecurityLockStore((s) => s.lock)

  if (!securityEnabled) return <></>

  return (
    <SettingRow
      label="Lock Now"
      description="Immediately lock the app and require your password or PIN to continue."
    >
      <Button variant="outline" size="sm" onClick={lock}>
        <LockKeyhole className="w-3.5 h-3.5 mr-1.5" />
        Lock
      </Button>
    </SettingRow>
  )
})

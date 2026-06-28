import { memo } from 'react'
import { Switch } from '@/components/ui/switch'
import { useSettingsStore } from '@/store/settings-store'
import { SettingRow } from '../SettingRow'

export const RestoreLastAppSetting = memo(function RestoreLastAppSetting(): React.JSX.Element {
  const restoreLastApp = useSettingsStore((s) => s.restoreLastApp)
  const setRestoreLastApp = useSettingsStore((s) => s.setRestoreLastApp)

  return (
    <SettingRow
      label="Restore last opened app"
      description="When enabled, the application will reopen the last active app (e.g. Explorer, Notes, Terminal) on startup instead of always starting on Dashboard."
    >
      <Switch checked={restoreLastApp} onCheckedChange={setRestoreLastApp} />
    </SettingRow>
  )
})

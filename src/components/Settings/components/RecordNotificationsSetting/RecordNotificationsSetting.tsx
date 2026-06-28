import { memo } from 'react'
import { Switch } from '@/components/ui/switch'
import { useSettingsStore } from '@/store/settings-store'
import { SettingRow } from '../SettingRow'

export const RecordNotificationsSetting = memo(function RecordNotificationsSetting(): React.JSX.Element {
  const recordNotifications = useSettingsStore((s) => s.recordNotifications)
  const setRecordNotifications = useSettingsStore((s) => s.setRecordNotifications)

  return (
    <SettingRow
      label="Record notifications"
      description="When enabled, all in-app and OS notifications are saved to a local history (up to 1,000 most recent). Turn off to stop recording."
    >
      <Switch checked={recordNotifications} onCheckedChange={setRecordNotifications} />
    </SettingRow>
  )
})

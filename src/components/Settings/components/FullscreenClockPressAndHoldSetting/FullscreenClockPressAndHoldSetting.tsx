import { memo } from 'react'
import { Switch } from '@/components/ui/switch'
import { useSettingsStore } from '@/store/settings-store'
import { SettingRow } from '../SettingRow'

export const FullscreenClockPressAndHoldSetting = memo(function FullscreenClockPressAndHoldSetting(): React.JSX.Element {
  const enabled = useSettingsStore((s) => s.fullscreenClockPressAndHold)
  const setEnabled = useSettingsStore((s) => s.setFullscreenClockPressAndHold)

  return (
    <SettingRow
      label="Press-and-Hold to Peek"
      description="Show the fullscreen clock only while the shortcut is held. Releasing dismisses it. When off, the shortcut toggles the clock and it auto-dismisses."
    >
      <Switch checked={enabled} onCheckedChange={setEnabled} />
    </SettingRow>
  )
})

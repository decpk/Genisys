import { memo } from 'react'
import { Switch } from '@/components/ui/switch'
import { useSettingsStore } from '@/store/settings-store'
import { SettingRow } from '../SettingRow'

export const VoiceCommandsSetting = memo(function VoiceCommandsSetting(): React.JSX.Element {
  const voiceCommandsEnabled = useSettingsStore((s) => s.voiceCommandsEnabled)
  const setVoiceCommandsEnabled = useSettingsStore((s) => s.setVoiceCommandsEnabled)

  return (
    <SettingRow
      label="Voice Commands"
      description="Enable voice commands like 'send message', 'new line', 'clear', and 'stop listening' during dictation."
    >
      <Switch checked={voiceCommandsEnabled} onCheckedChange={setVoiceCommandsEnabled} />
    </SettingRow>
  )
})

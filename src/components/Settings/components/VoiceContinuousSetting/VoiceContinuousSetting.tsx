import { memo } from 'react'
import { Switch } from '@/components/ui/switch'
import { useSettingsStore } from '@/store/settings-store'
import { SettingRow } from '../SettingRow'

export const VoiceContinuousSetting = memo(function VoiceContinuousSetting(): React.JSX.Element {
  const voiceContinuousDictation = useSettingsStore((s) => s.voiceContinuousDictation)
  const setVoiceContinuousDictation = useSettingsStore((s) => s.setVoiceContinuousDictation)

  return (
    <SettingRow
      label="Continuous Dictation"
      description="Keep recording across pauses without stopping. When disabled, recording stops after a period of silence."
    >
      <Switch checked={voiceContinuousDictation} onCheckedChange={setVoiceContinuousDictation} />
    </SettingRow>
  )
})

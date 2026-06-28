import { VoiceModelSetting } from '../components/VoiceModelSetting'
import { VoiceLanguageSetting } from '../components/VoiceLanguageSetting'
import { VoiceCommandsSetting } from '../components/VoiceCommandsSetting'
import { VoiceContinuousSetting } from '../components/VoiceContinuousSetting'

export function VoiceSection(): React.JSX.Element {
  return (
    <>
      <VoiceModelSetting />
      <VoiceLanguageSetting />
      <VoiceCommandsSetting />
      <VoiceContinuousSetting />
    </>
  )
}

import { TtsModelSetting } from '../components/TtsModelSetting'
import { TtsVoiceSetting } from '../components/TtsVoiceSetting'
import { TtsSpeedSetting } from '../components/TtsSpeedSetting'

export function TtsSection(): React.JSX.Element {
  return (
    <>
      <TtsModelSetting />
      <TtsVoiceSetting />
      <TtsSpeedSetting />
    </>
  )
}

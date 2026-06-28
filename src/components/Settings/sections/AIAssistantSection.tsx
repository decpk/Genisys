import { AiDefaultModeSetting } from '../components/AiDefaultModeSetting'
import { AiAppModesSetting } from '../components/AiAppModesSetting'
import { DefaultModelSetting } from '../components/DefaultModelSetting'
import { AiPanelToolsSetting } from '../components/AiPanelToolsSetting'

export function AIAssistantSection(): React.JSX.Element {
  return (
    <>
      <DefaultModelSetting />
      <AiDefaultModeSetting />
      <AiAppModesSetting />
      <AiPanelToolsSetting />
    </>
  )
}

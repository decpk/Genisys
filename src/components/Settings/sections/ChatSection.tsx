import { AiProvidersSetting } from '../components/AiProvidersSetting'
import { ChatWidthSetting } from '../components/ChatWidthSetting'
import { McpServersSetting } from '../components/McpServersSetting'
import { HideWhileSearching } from '../components/HideWhileSearching'

export function ChatSection(): React.JSX.Element {
  return (
    <>
      <AiProvidersSetting />
      <ChatWidthSetting />
      <HideWhileSearching>
        <McpServersSetting />
      </HideWhileSearching>
    </>
  )
}

import { memo } from 'react'
import { ButtonGroup } from '@/components/ui/button-group'
import { useSettingsStore } from '@/store/settings-store'
import { SettingRow } from '../SettingRow'
import { CHAT_WIDTH_OPTIONS } from '../../Settings.constants'

const WIDTH_OPTIONS = CHAT_WIDTH_OPTIONS.map((w) => ({ value: w, label: `${w}%` }))

export const ChatWidthSetting = memo(function ChatWidthSetting(): React.JSX.Element {
  const chatWidthPercent = useSettingsStore((s) => s.chatWidthPercent)
  const setChatWidthPercent = useSettingsStore((s) => s.setChatWidthPercent)

  return (
    <SettingRow
      label="Message width"
      description="Controls the maximum width of messages in the chat panel. A higher percentage uses more horizontal space."
    >
      <ButtonGroup
        options={WIDTH_OPTIONS}
        value={chatWidthPercent}
        onChange={setChatWidthPercent}
      />
    </SettingRow>
  )
})

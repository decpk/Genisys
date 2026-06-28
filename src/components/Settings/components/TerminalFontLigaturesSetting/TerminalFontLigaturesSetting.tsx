import { memo } from 'react'

import { Switch } from '@/components/ui/switch'

import { SettingRow } from '../SettingRow'

import { useTerminalFontLigaturesSettingData } from './useTerminalFontLigaturesSettingData'

export const TerminalFontLigaturesSetting = memo(function TerminalFontLigaturesSetting(): React.JSX.Element {
  const { value, setValue } = useTerminalFontLigaturesSettingData()
  return (
    <SettingRow
      label="Terminal font ligatures"
      description="Enable programming ligatures in the terminal when the selected font supports them. Disabled by default since many shells render ligatures unpredictably."
    >
      <Switch checked={value} onCheckedChange={setValue} />
    </SettingRow>
  )
})

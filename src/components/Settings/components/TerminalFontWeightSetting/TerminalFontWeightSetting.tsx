import { memo } from 'react'

import { SettingRow } from '../SettingRow'
import { TypographyWeightPicker } from '../typography/TypographyWeightPicker'

import { useTerminalFontWeightSettingData } from './useTerminalFontWeightSettingData'

export const TerminalFontWeightSetting = memo(function TerminalFontWeightSetting(): React.JSX.Element {
  const { value, setValue } = useTerminalFontWeightSettingData()
  return (
    <SettingRow
      label="Terminal font weight"
      description="Stroke weight of terminal text. Bold weights improve legibility on high-DPI displays."
    >
      <TypographyWeightPicker value={value} onChange={setValue} />
    </SettingRow>
  )
})

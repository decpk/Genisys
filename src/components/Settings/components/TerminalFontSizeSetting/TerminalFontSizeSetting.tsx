import { memo } from 'react'

import { SettingRow } from '../SettingRow'
import { TypographyStepper } from '../typography/TypographyStepper'

import { useTerminalFontSizeSettingData } from './useTerminalFontSizeSettingData'
import {
  TERMINAL_FONT_SIZE_MIN,
  TERMINAL_FONT_SIZE_MAX,
  TERMINAL_FONT_SIZE_DEFAULT,
  TERMINAL_FONT_SIZE_STEP,
} from './TerminalFontSizeSetting.constants'

const formatPx = (v: number): string => `${v}px`

export const TerminalFontSizeSetting = memo(function TerminalFontSizeSetting(): React.JSX.Element {
  const { value, setValue } = useTerminalFontSizeSettingData()
  return (
    <SettingRow
      label="Terminal font size"
      description={`Font size used by the integrated terminal. Range: ${TERMINAL_FONT_SIZE_MIN}–${TERMINAL_FONT_SIZE_MAX}px.`}
    >
      <TypographyStepper
        value={value}
        onChange={setValue}
        min={TERMINAL_FONT_SIZE_MIN}
        max={TERMINAL_FONT_SIZE_MAX}
        step={TERMINAL_FONT_SIZE_STEP}
        defaultValue={TERMINAL_FONT_SIZE_DEFAULT}
        format={formatPx}
      />
    </SettingRow>
  )
})

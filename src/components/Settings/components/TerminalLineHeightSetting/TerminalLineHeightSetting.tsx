import { memo } from 'react'

import { SettingRow } from '../SettingRow'
import { TypographyStepper } from '../typography/TypographyStepper'

import { useTerminalLineHeightSettingData } from './useTerminalLineHeightSettingData'
import {
  TERMINAL_LINE_HEIGHT_MIN,
  TERMINAL_LINE_HEIGHT_MAX,
  TERMINAL_LINE_HEIGHT_DEFAULT,
  TERMINAL_LINE_HEIGHT_STEP,
  TERMINAL_LINE_HEIGHT_DECIMALS,
} from './TerminalLineHeightSetting.constants'

const formatLineHeight = (v: number): string => v.toFixed(1)

export const TerminalLineHeightSetting = memo(function TerminalLineHeightSetting(): React.JSX.Element {
  const { value, setValue } = useTerminalLineHeightSettingData()
  return (
    <SettingRow
      label="Terminal line height"
      description={`Vertical spacing multiplier for terminal rows. Range: ${TERMINAL_LINE_HEIGHT_MIN.toFixed(1)}–${TERMINAL_LINE_HEIGHT_MAX.toFixed(1)}.`}
    >
      <TypographyStepper
        value={value}
        onChange={setValue}
        min={TERMINAL_LINE_HEIGHT_MIN}
        max={TERMINAL_LINE_HEIGHT_MAX}
        step={TERMINAL_LINE_HEIGHT_STEP}
        defaultValue={TERMINAL_LINE_HEIGHT_DEFAULT}
        decimals={TERMINAL_LINE_HEIGHT_DECIMALS}
        format={formatLineHeight}
      />
    </SettingRow>
  )
})

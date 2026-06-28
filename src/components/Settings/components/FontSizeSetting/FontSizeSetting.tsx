import { memo, useCallback } from 'react'
import { Minus, Plus, RotateCcw } from 'lucide-react'

import { useSettingsStore } from '@/store/settings-store'
import { IconButton } from '@/components/ui/icon-button'
import { SettingRow } from '../SettingRow'

const MIN_FONT_SIZE = 12
const MAX_FONT_SIZE = 24
const DEFAULT_FONT_SIZE = 14;
const STEP = 1

export const FontSizeSetting = memo(function FontSizeSetting(): React.JSX.Element {
  const fontSize = useSettingsStore((s) => s.fontSize)
  const setFontSize = useSettingsStore((s) => s.setFontSize)

  const handleIncrease = useCallback(() => {
    setFontSize(Math.min(fontSize + STEP, MAX_FONT_SIZE))
  }, [fontSize, setFontSize])

  const handleDecrease = useCallback(() => {
    setFontSize(Math.max(fontSize - STEP, MIN_FONT_SIZE))
  }, [fontSize, setFontSize])

  const handleReset = useCallback(() => {
    setFontSize(DEFAULT_FONT_SIZE)
  }, [setFontSize])

  return (
    <SettingRow
      label="Font size"
      description={`Base font size for the entire application. All elements using rem units will scale accordingly. Range: ${MIN_FONT_SIZE}–${MAX_FONT_SIZE}px.`}
    >
      <div className="flex items-center gap-2">
        <IconButton
          tooltip="Decrease font size"
          tooltipSide="bottom"
          className="border border-border"
          onClick={handleDecrease}
          disabled={fontSize <= MIN_FONT_SIZE}
        >
          <Minus size={14} />
        </IconButton>
        <span className="text-sm text-foreground min-w-[4ch] text-center">
          {fontSize}px
        </span>
        <IconButton
          tooltip="Increase font size"
          tooltipSide="bottom"
          className="border border-border"
          onClick={handleIncrease}
          disabled={fontSize >= MAX_FONT_SIZE}
        >
          <Plus size={14} />
        </IconButton>
        {fontSize !== DEFAULT_FONT_SIZE && (
          <IconButton
            tooltip="Reset to 16px"
            tooltipSide="bottom"
            className="border border-border ml-1"
            onClick={handleReset}
          >
            <RotateCcw size={14} />
          </IconButton>
        )}
      </div>
    </SettingRow>
  );
})

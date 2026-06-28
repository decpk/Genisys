import { ColorPicker } from '@/components/ColorPicker'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import { STYLES } from '../../ThemeEditor.styles'

export interface ColorTokenEditableInputsProps {
  hex: string
  hsl: { h: number; s: number; l: number }
  swatchColor: string
  optional: boolean
  onHexChange: (raw: string) => void
  onChannelChange: (channel: 'h' | 's' | 'l', raw: string) => void
  onClear: () => void
}

export function ColorTokenEditableInputs(props: ColorTokenEditableInputsProps): React.JSX.Element {
  const { hex, hsl, swatchColor, optional, onHexChange, onChannelChange, onClear } = props

  let resetButton: React.ReactNode = null
  if (optional) {
    resetButton = (
      <button
        type="button"
        className={STYLES.fallbackPill}
        onClick={onClear}
        title="Reset to fallback"
      >
        reset
      </button>
    )
  }

  return (
    <div className={STYLES.tokenInputs}>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={STYLES.tokenSwatch}
            style={{ backgroundColor: swatchColor }}
            aria-label="Open color picker"
          />
        </PopoverTrigger>
        <PopoverContent align="start" sideOffset={6} className="w-auto p-3">
          <ColorPicker hex={hex} onChange={onHexChange} />
        </PopoverContent>
      </Popover>
      <input
        type="text"
        value={hex}
        onChange={(e) => onHexChange(e.target.value)}
        className={STYLES.tokenHexInput}
        spellCheck={false}
        aria-label="Hex value"
      />
      <input
        type="number"
        min={0}
        max={360}
        value={hsl.h}
        onChange={(e) => onChannelChange('h', e.target.value)}
        className={STYLES.tokenNumberInput}
        aria-label="Hue"
      />
      <span className={STYLES.tokenInputSuffix}>°</span>
      <input
        type="number"
        min={0}
        max={100}
        value={hsl.s}
        onChange={(e) => onChannelChange('s', e.target.value)}
        className={STYLES.tokenNumberInput}
        aria-label="Saturation"
      />
      <span className={STYLES.tokenInputSuffix}>%</span>
      <input
        type="number"
        min={0}
        max={100}
        value={hsl.l}
        onChange={(e) => onChannelChange('l', e.target.value)}
        className={STYLES.tokenNumberInput}
        aria-label="Lightness"
      />
      <span className={STYLES.tokenInputSuffix}>%</span>
      {resetButton}
    </div>
  )
}

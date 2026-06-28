import { HelpCircle } from 'lucide-react'

import { Tooltip } from '@/components/Tooltip'

import type { ColorTokenFieldProps } from '../../ThemeEditor.types'
import { STYLES } from '../../ThemeEditor.styles'
import { ColorTokenEditableInputs } from '../ColorTokenEditableInputs'
import { useColorTokenFieldData } from './useColorTokenFieldData'

const FALLBACK_HSL = { h: 0, s: 0, l: 50 }

export function ColorTokenField(props: ColorTokenFieldProps): React.JSX.Element {
  const { tokenKey, label, description, exampleUsage, optional, value, onChange } = props
  const data = useColorTokenFieldData(value, FALLBACK_HSL, optional, onChange)

  const tooltipBody = (
    <div className="max-w-[260px] flex flex-col gap-1.5">
      <div className="text-[11px] font-semibold text-background">{label}</div>
      <div className="text-[11px] text-background/85 leading-relaxed">
        {description}
      </div>
      <div className="text-[10px] text-background/70 italic">
        e.g. {exampleUsage}
      </div>
      <div className="text-[10px] text-background/60 font-mono pt-0.5">
        --color-{tokenKey}
      </div>
    </div>
  );

  const helpButton = (
    <button type="button" className={STYLES.tokenHelpButton} aria-label={`Help: ${label}`}>
      <HelpCircle size={11} />
    </button>
  )

  let body: React.ReactNode
  if (data.isFallback) {
    body = (
      <button
        type="button"
        className={STYLES.fallbackPill}
        onClick={data.enableOverride}
        title="Customize this token"
      >
        Using fallback — click to override
      </button>
    )
  } else {
    body = (
      <ColorTokenEditableInputs
        hex={data.hex}
        hsl={data.hsl}
        swatchColor={data.swatchColor}
        optional={optional}
        onHexChange={data.changeHex}
        onChannelChange={data.changeChannel}
        onClear={data.disableOverride}
      />
    )
  }

  return (
    <div className={STYLES.tokenRow}>
      <div className={STYLES.tokenLabelBlock}>
        <div className={STYLES.tokenLabel}>
          <span className="truncate">{label}</span>
          <Tooltip
            content={tooltipBody}
            side="top"
            interactive
            className="!whitespace-normal !px-4 !py-3"
          >
            {helpButton}
          </Tooltip>
        </div>
        <div className={STYLES.tokenExample}>{exampleUsage}</div>
      </div>
      {body}
    </div>
  );
}

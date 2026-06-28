import { AlarmClock, ChevronDown, ArrowDownToLine, Copy, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/Tooltip'
import { useCarryOverBannerData } from './hooks/useCarryOverBannerData'
import { CarryOverItemRow } from './components/CarryOverItemRow'
import {
  CONTAINER,
  HEADER_ROW,
  HEADER_BUTTON,
  HEADER_ICON_WRAP,
  HEADER_ICON,
  HEADER_TEXT,
  HEADER_LABEL,
  HEADER_SUBLABEL,
  HEADER_COUNT,
  HEADER_CHEVRON,
  HEADER_ACTIONS,
  ACTION_BTN,
  ACTION_ICON,
  BODY,
} from './CarryOverBanner.styles'

export function CarryOverBanner(): React.JSX.Element {
  const banner = useCarryOverBannerData()

  if (!banner.visible) return <></>

  const chevronClass = banner.isExpanded ? cn(HEADER_CHEVRON, 'rotate-180') : HEADER_CHEVRON
  const noun = banner.count === 1 ? 'item' : 'items'
  const subtitle = `${noun} from yesterday`

  const body = banner.isExpanded ? (
    <div className={BODY}>
      {banner.entries.map((entry) => (
        <CarryOverItemRow
          key={`${entry.type}-${entry.data.id}`}
          entry={entry}
          onMove={banner.moveEntry}
          onCopy={banner.copyEntry}
        />
      ))}
    </div>
  ) : null

  return (
    <div className={CONTAINER}>
      <div className={HEADER_ROW}>
        <Button
          variant="ghost"
          size="sm"
          className={HEADER_BUTTON}
          onClick={banner.toggleExpanded}
        >
          <span className={HEADER_ICON_WRAP}>
            <AlarmClock className={HEADER_ICON} />
          </span>
          <span className={HEADER_TEXT}>
            <span className={HEADER_LABEL}>Carried over</span>
            <span className={HEADER_SUBLABEL}>{subtitle}</span>
          </span>
          <span className={HEADER_COUNT}>{banner.count}</span>
          <ChevronDown className={chevronClass} />
        </Button>
        <div className={HEADER_ACTIONS}>
          <Tooltip content="Copy all to today">
            <Button
              variant="ghost"
              size="icon"
              className={ACTION_BTN}
              onClick={banner.copyAll}
            >
              <Copy className={ACTION_ICON} />
            </Button>
          </Tooltip>
          <Tooltip content="Move all to today">
            <Button
              variant="ghost"
              size="icon"
              className={ACTION_BTN}
              onClick={banner.moveAll}
            >
              <ArrowDownToLine className={ACTION_ICON} />
            </Button>
          </Tooltip>
          <Tooltip content="Dismiss for today">
            <Button
              variant="ghost"
              size="icon"
              className={ACTION_BTN}
              onClick={banner.dismiss}
            >
              <X className={ACTION_ICON} />
            </Button>
          </Tooltip>
        </div>
      </div>
      {body}
    </div>
  )
}

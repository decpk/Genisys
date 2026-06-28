import { ArrowDownToLine, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/Tooltip'
import { CARRY_OVER_ICON_MAP } from '../../CarryOverBanner.constants'
import type { CarryOverItemRowProps } from './CarryOverItemRow.types'
import {
  ROW,
  ICON_WRAP,
  ICON,
  TITLE,
  ACTIONS,
  MOVE_BTN,
  MOVE_ICON,
  COPY_BTN,
  COPY_ICON,
} from './CarryOverItemRow.styles'

export function CarryOverItemRow(props: CarryOverItemRowProps): React.JSX.Element {
  const { entry, onMove, onCopy } = props
  const Icon = CARRY_OVER_ICON_MAP[entry.type]
  const handleMove = () => onMove(entry)
  const handleCopy = () => onCopy(entry)

  return (
    <div className={ROW}>
      <span className={ICON_WRAP}>
        <Icon className={ICON} />
      </span>
      <span className={TITLE}>{entry.data.title}</span>
      <div className={ACTIONS}>
        <Tooltip content="Copy to today">
          <Button
            variant="ghost"
            size="icon"
            className={COPY_BTN}
            onClick={handleCopy}
          >
            <Copy className={COPY_ICON} />
          </Button>
        </Tooltip>
        <Tooltip content="Move to today">
          <Button
            variant="ghost"
            size="icon"
            className={MOVE_BTN}
            onClick={handleMove}
          >
            <ArrowDownToLine className={MOVE_ICON} />
          </Button>
        </Tooltip>
      </div>
    </div>
  )
}

import { memo } from 'react'
import { Coffee, GripVertical } from 'lucide-react'

import { Checkbox } from '@/components/ui/checkbox'
import { IconButton } from '@/components/ui/icon-button'
import { Switch } from '@/components/ui/switch'

import { TileResizeMenu } from '../TileResizeMenu'
import {
  KEEP_AWAKE_LID_LABEL_TEXT,
  KEEP_AWAKE_SWITCH_LABEL,
  KEEP_AWAKE_TILE_TITLE,
} from './KeepAwakeTile.constants'
import { KeepAwakeError } from './components/KeepAwakeError'
import {
  KEEP_AWAKE_BODY,
  KEEP_AWAKE_CARD,
  KEEP_AWAKE_CONTROLS,
  KEEP_AWAKE_DRAG_HANDLE,
  KEEP_AWAKE_HEADER,
  KEEP_AWAKE_HEADER_TITLE,
  KEEP_AWAKE_ICON_OFF,
  KEEP_AWAKE_ICON_ON,
  KEEP_AWAKE_LID_ERROR,
  KEEP_AWAKE_LID_LABEL,
  KEEP_AWAKE_LID_ROW,
  KEEP_AWAKE_SWITCH,
} from './KeepAwakeTile.styles'
import { useKeepAwakeTileData } from './useKeepAwakeTileData'
import { getKeepAwakeStatus } from './utils/getKeepAwakeStatus'
import type { KeepAwakeTileProps } from './KeepAwakeTile.types'

export const KeepAwakeTile = memo(function KeepAwakeTile(
  props: KeepAwakeTileProps,
): React.JSX.Element {
  const { tileWidth, onWidthChange, dragHandleProps } = props
  const {
    isActive,
    isBusy,
    error,
    pendingEnable,
    lidClose,
    isLidBusy,
    lidError,
    toggle,
    setLidClose,
    openAccessibilitySettings,
    recheckPermission,
  } = useKeepAwakeTileData()

  const status = getKeepAwakeStatus(isActive)
  const iconClassName = isActive ? KEEP_AWAKE_ICON_ON : KEEP_AWAKE_ICON_OFF
  const errorNode = error ? (
    <KeepAwakeError
      message={error}
      onOpenSettings={pendingEnable ? openAccessibilitySettings : undefined}
      onRetry={pendingEnable ? recheckPermission : undefined}
      showQuitHint={pendingEnable}
    />
  ) : null

  return (
    <div className={KEEP_AWAKE_CARD}>
      {/* Action buttons — top-right, shown on hover */}
      <div className={KEEP_AWAKE_CONTROLS}>
        <TileResizeMenu tileWidth={tileWidth} onWidthChange={onWidthChange} />
        <IconButton
          tooltip="Drag to reorder"
          tooltipSide="bottom"
          size="xs"
          className={KEEP_AWAKE_DRAG_HANDLE}
          {...dragHandleProps.attributes}
          {...dragHandleProps.listeners}
        >
          <GripVertical size={14} />
        </IconButton>
      </div>

      {/* Header */}
      <div className={KEEP_AWAKE_HEADER}>
        <Coffee size={16} className={iconClassName} />
        <span className={KEEP_AWAKE_HEADER_TITLE}>{KEEP_AWAKE_TILE_TITLE}</span>
      </div>

      {/* Body */}
      <div className={KEEP_AWAKE_BODY}>
        <Switch
          checked={isActive}
          disabled={isBusy}
          onCheckedChange={toggle}
          aria-label={KEEP_AWAKE_SWITCH_LABEL}
          className={KEEP_AWAKE_SWITCH}
        />
        <p className={status.className}>{status.label}</p>

        <div className={KEEP_AWAKE_LID_ROW}>
          <Checkbox
            id="keep-awake-lid"
            checked={lidClose}
            disabled={!isActive || isLidBusy}
            onCheckedChange={(checked) => setLidClose(checked === true)}
          />
          <label htmlFor="keep-awake-lid" className={KEEP_AWAKE_LID_LABEL}>
            {KEEP_AWAKE_LID_LABEL_TEXT}
          </label>
        </div>
        {lidError ? <p className={KEEP_AWAKE_LID_ERROR}>{lidError}</p> : null}

        {errorNode}
      </div>
    </div>
  )
})

import { Maximize2, Settings as SettingsIcon, X } from 'lucide-react'

import { Tooltip } from '@/components/Tooltip'
import { cn } from '@/lib/utils'

import { settingsFloatingWindowStyles as S } from '../../SettingsFloatingWindow.styles'
import type { SettingsFloatingWindowHeaderProps } from '../../SettingsFloatingWindow.types'

export function SettingsFloatingWindowHeader({
  activeApp,
  isDragging,
  onOpenFullApp,
  onClose,
  dragHandleProps,
}: SettingsFloatingWindowHeaderProps) {
  return (
    <div className={S.header.container}>
      <div
        className={cn(
          S.header.dragRegion,
          isDragging && S.header.dragRegionActive,
        )}
        {...dragHandleProps}
      >
        <SettingsIcon className={S.header.icon} aria-hidden />
        <span className={S.header.title}>Settings</span>
        <span className={S.header.subtitle}>· {activeApp}</span>
      </div>

      <div className={S.header.actions}>
        <Tooltip content="Open full Settings" shortcut="Mod+Shift+," side="bottom">
          <button
            type="button"
            onClick={onOpenFullApp}
            className={S.header.iconButton}
            aria-label="Open full Settings"
          >
            <Maximize2 className="size-3.5" />
          </button>
        </Tooltip>
        <Tooltip content="Close" shortcut="Escape" side="bottom">
          <button
            type="button"
            onClick={onClose}
            className={S.header.iconButton}
            aria-label="Close Settings"
          >
            <X className="size-4" />
          </button>
        </Tooltip>
      </div>
    </div>
  )
}

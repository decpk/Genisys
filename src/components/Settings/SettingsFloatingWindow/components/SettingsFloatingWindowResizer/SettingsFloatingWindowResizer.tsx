import { settingsFloatingWindowStyles as S } from '../../SettingsFloatingWindow.styles'
import type { SettingsFloatingWindowResizerProps } from '../../SettingsFloatingWindow.types'

export function SettingsFloatingWindowResizer({
  resizeHandleProps,
}: SettingsFloatingWindowResizerProps) {
  return (
    <div
      className={S.resizer.handle}
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize window"
      {...resizeHandleProps}
    >
      <span className={S.resizer.grip} aria-hidden />
    </div>
  )
}

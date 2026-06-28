import {
  KEEP_AWAKE_STATUS_OFF,
  KEEP_AWAKE_STATUS_ON,
} from '../KeepAwakeTile.constants'
import {
  KEEP_AWAKE_STATUS_TEXT_OFF,
  KEEP_AWAKE_STATUS_TEXT_ON,
} from '../KeepAwakeTile.styles'

export interface KeepAwakeStatusView {
  label: string
  className: string
}

/** Resolve the status label + text style for the current active state. */
export function getKeepAwakeStatus(isActive: boolean): KeepAwakeStatusView {
  if (isActive) {
    return { label: KEEP_AWAKE_STATUS_ON, className: KEEP_AWAKE_STATUS_TEXT_ON }
  }
  return { label: KEEP_AWAKE_STATUS_OFF, className: KEEP_AWAKE_STATUS_TEXT_OFF }
}

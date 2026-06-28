import { memo } from 'react'
import { ShieldAlert } from 'lucide-react'

import { KEEP_AWAKE_ERROR_TITLE_TEXT } from '../../KeepAwakeTile.constants'
import {
  KEEP_AWAKE_ERROR_ACTIONS,
  KEEP_AWAKE_ERROR_BODY,
  KEEP_AWAKE_ERROR_BTN_PRIMARY,
  KEEP_AWAKE_ERROR_BTN_SECONDARY,
  KEEP_AWAKE_ERROR_CARD,
  KEEP_AWAKE_ERROR_HINT,
  KEEP_AWAKE_ERROR_ICON,
  KEEP_AWAKE_ERROR_MESSAGE,
  KEEP_AWAKE_ERROR_TITLE,
} from './KeepAwakeError.styles'
import type { KeepAwakeErrorProps } from './KeepAwakeError.types'

export const KeepAwakeError = memo(function KeepAwakeError(
  props: KeepAwakeErrorProps,
): React.JSX.Element {
  const { message, onOpenSettings, onRetry, showQuitHint } = props
  const hasActions = Boolean(onOpenSettings || onRetry)

  return (
    <div role="alert" className={KEEP_AWAKE_ERROR_CARD}>
      <ShieldAlert size={15} className={KEEP_AWAKE_ERROR_ICON} />
      <div className={KEEP_AWAKE_ERROR_BODY}>
        <span className={KEEP_AWAKE_ERROR_TITLE}>
          {KEEP_AWAKE_ERROR_TITLE_TEXT}
        </span>
        <span className={KEEP_AWAKE_ERROR_MESSAGE}>{message}</span>
        {hasActions ? (
          <div className={KEEP_AWAKE_ERROR_ACTIONS}>
            {onOpenSettings ? (
              <button
                type="button"
                onClick={onOpenSettings}
                className={KEEP_AWAKE_ERROR_BTN_PRIMARY}
              >
                Open Accessibility Settings
              </button>
            ) : null}
            {onRetry ? (
              <button
                type="button"
                onClick={onRetry}
                className={KEEP_AWAKE_ERROR_BTN_SECONDARY}
              >
                I&apos;ve enabled it — retry
              </button>
            ) : null}
          </div>
        ) : null}
        {showQuitHint ? (
          <span className={KEEP_AWAKE_ERROR_HINT}>
            Already enabled in the list? Quit and reopen Genisys to finish.
          </span>
        ) : null}
      </div>
    </div>
  )
})

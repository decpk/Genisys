import { createPortal } from 'react-dom'

import type { ClipboardHoverBackdropProps } from './ClipboardHoverBackdrop.types'

/**
 * Fullscreen scrim rendered into `document.body` whenever a clipboard
 * image hover popover is open. Sits above the rest of the app
 * (`z-40`) but below the popover (`z-50`) so the surrounding UI fades
 * and blurs while the active thumbnail + popover remain crisp.
 *
 * `pointer-events-none` keeps the underlying HoverCard hover tracking
 * intact — the scrim is purely visual.
 */
export function ClipboardHoverBackdrop(
  props: ClipboardHoverBackdropProps
): React.JSX.Element | null {
  const { open } = props

  if (!open) return null
  if (typeof document === 'undefined') return null

  return createPortal(
    <div
      aria-hidden="true"
      className="fixed inset-0 z-40 bg-background/40 backdrop-blur-md pointer-events-none animate-in fade-in-0 duration-200"
    />,
    document.body
  )
}

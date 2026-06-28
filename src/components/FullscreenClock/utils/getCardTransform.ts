interface CardTransformInput {
  visible: boolean
  isLeaving: boolean
}

interface CardTransform {
  className: string
  style: React.CSSProperties
}

/** How long the snap-into-PiP transition itself runs. Shorter than the
 *  full `leaveBeforeMs` so the PiP holds visibly before sliding away. */
const PIP_SNAP_DURATION_MS = 900
const PIP_EXIT_DURATION_MS = 520
const PIP_ENTER_DURATION_MS = 380

/**
 * Decide the card's transform + radius + shadow for each phase:
 *  - entering (!visible on first mount): below-screen + slightly small
 *  - idle    (visible && !isLeaving): centered, full 95vw × 95vh card
 *  - leaving (visible && isLeaving):  shrinks into a corner PiP window
 *  - exiting (!visible after visible): PiP slides straight down off-screen
 */
export function getCardTransform(
  input: CardTransformInput,
  // Reserved for future tuning. Currently we keep a fixed PiP snap so the
  // user gets a consistent "window snaps to corner" feel regardless of the
  // overall auto-dismiss timeout.
  _leaveBeforeMs: number,
): CardTransform {
  void _leaveBeforeMs
  const { visible, isLeaving } = input

  // EXITING (after PiP) — slide straight down from the corner, keeping the
  // tiny scale so it visually feels like the PiP window is dropping off.
  if (!visible && isLeaving) {
    return {
      className: '',
      style: {
        transform: 'translate3d(38vw, 110vh, 0) scale(0.22)',
        opacity: 0,
        borderRadius: '1.25rem',
        transition: `transform ${PIP_EXIT_DURATION_MS}ms cubic-bezier(0.5, 0, 0.75, 0), opacity ${PIP_EXIT_DURATION_MS - 80}ms ease-in, border-radius ${PIP_EXIT_DURATION_MS}ms ease-in`,
        willChange: 'transform, opacity',
      },
    }
  }

  // INITIAL ENTER — slide up from below into the centered position.
  if (!visible) {
    return {
      className: '',
      style: {
        transform: 'translate3d(0, 12vh, 0) scale(0.92)',
        opacity: 0,
        transition: `transform ${PIP_ENTER_DURATION_MS}ms cubic-bezier(0.16, 1, 0.3, 1), opacity ${PIP_ENTER_DURATION_MS}ms ease-out`,
        willChange: 'transform, opacity',
      },
    }
  }

  // LEAVING — snap into a tight Picture-in-Picture window pinned to the
  // bottom-right corner. We translate then scale: the centered 95vw × 95vh
  // card moves so its center lands near (88vw, 88vh) and shrinks to ~21vw,
  // mimicking macOS/YouTube PiP behaviour. A tighter radius + softer shadow
  // sells the "floating mini window" feel.
  if (isLeaving) {
    return {
      className: '',
      style: {
        transform: 'translate3d(38vw, 38vh, 0) scale(0.22)',
        opacity: 1,
        borderRadius: '1.25rem',
        boxShadow:
          '0 24px 60px -12px rgba(0, 0, 0, 0.55), 0 6px 18px -4px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        transition: `transform ${PIP_SNAP_DURATION_MS}ms cubic-bezier(0.32, 0.72, 0, 1), border-radius ${PIP_SNAP_DURATION_MS}ms ease-out, box-shadow ${PIP_SNAP_DURATION_MS}ms ease-out`,
        willChange: 'transform',
      },
    }
  }

  // IDLE — centered hero card.
  return {
    className: '',
    style: {
      transform: 'translate3d(0, 0, 0) scale(1)',
      opacity: 1,
      transition: `transform ${PIP_ENTER_DURATION_MS}ms cubic-bezier(0.16, 1, 0.3, 1), opacity ${PIP_ENTER_DURATION_MS - 80}ms ease-out`,
      willChange: 'transform',
    },
  }
}

import type { FlipDigitProps } from './FlipDigit.types'

import { useFlipDigitData } from './useFlipDigitData'
import {
  FLIP_CARD_DIGIT,
  FLIP_CARD_WRAPPER,
  FLIP_FLAP_BOTTOM,
  FLIP_FLAP_TOP,
  FLIP_HALF_BOTTOM,
  FLIP_HALF_TOP,
  FLIP_HINGE,
  FLIP_INNER_BOTTOM,
  FLIP_INNER_TOP,
} from './FlipDigit.styles'

export function FlipDigit(props: FlipDigitProps): React.JSX.Element {
  const { digit } = props
  const { current, previous, isFlipping, flipKey, finishFlip } = useFlipDigitData(digit)

  return (
    <div style={FLIP_CARD_WRAPPER}>
      {/* Sizer: reserves the card's footprint so it matches a real digit. */}
      <span style={{ ...FLIP_CARD_DIGIT, visibility: 'hidden' }} aria-hidden>
        {current}
      </span>

      {/* Background top half — shows NEW digit (revealed once falling flap clears). */}
      <div style={FLIP_HALF_TOP}>
        <div style={FLIP_INNER_TOP}>
          <span style={FLIP_CARD_DIGIT}>{current}</span>
        </div>
      </div>

      {/* Background bottom half — shows OLD digit until rising flap covers it. */}
      <div style={FLIP_HALF_BOTTOM}>
        <div style={FLIP_INNER_BOTTOM}>
          <span style={FLIP_CARD_DIGIT}>{previous}</span>
        </div>
      </div>

      {/* Hinge line */}
      <div style={FLIP_HINGE} />

      {!isFlipping ? null : (
        <>
          {/* Falling top flap — OLD digit's top half rotates 0 → -90deg, pivots at mid-line. */}
          <div key={`top-${flipKey}`} style={{ ...FLIP_HALF_TOP, ...FLIP_FLAP_TOP }}>
            <div style={FLIP_INNER_TOP}>
              <span style={FLIP_CARD_DIGIT}>{previous}</span>
            </div>
          </div>

          {/* Rising bottom flap — NEW digit's bottom half rotates 90 → 0deg. The
              bottom flap's animation completes last, so we use it as our
              single source-of-truth signal that the flip has finished. */}
          <div
            key={`bottom-${flipKey}`}
            style={{ ...FLIP_HALF_BOTTOM, ...FLIP_FLAP_BOTTOM }}
            onAnimationEnd={finishFlip}
          >
            <div style={FLIP_INNER_BOTTOM}>
              <span style={FLIP_CARD_DIGIT}>{current}</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

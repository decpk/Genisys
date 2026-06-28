// All critical 3D + layout properties are expressed as inline styles so we
// don't depend on Tailwind v4 generating arbitrary classes like
// `[transform-style:preserve-3d]`. Animations themselves still come from
// `@keyframes` in main.css (referenced by name through `animationName`).

// Each card is rendered in two horizontal halves. The top half is lit a
// touch brighter and the bottom half a touch darker — together they read as
// a single plastic flap card with the hinge at the mid-line. These need to
// be SOLID/opaque so the rotating flap completely occludes whatever sits
// behind it (the static half showing the other digit).
const HALF_BG_TOP =
  'linear-gradient(180deg, var(--color-card) 0%, color-mix(in srgb, var(--color-card) 55%, var(--color-background)) 100%)'
const HALF_BG_BOTTOM =
  'linear-gradient(180deg, color-mix(in srgb, var(--color-card) 45%, var(--color-background)) 0%, var(--color-background) 100%)'

export const FLIP_CARD_WRAPPER: React.CSSProperties = {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '1rem',
  // Fallback color in case the halves don't fully render (e.g. during the
  // first frame before mount). The halves themselves are opaque.
  background: 'var(--color-card)',
  border: '1px solid rgb(255 255 255 / 0.07)',
  boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.45)',
  padding: 'clamp(0.4rem, 0.8vw, 1rem) clamp(0.5rem, 1vw, 1.25rem)',
  overflow: 'hidden',
  transformStyle: 'preserve-3d',
  isolation: 'isolate',
}

export const FLIP_CARD_DIGIT: React.CSSProperties = {
  fontSize: 'clamp(2.5rem, 6vw, 7.7rem)',
  fontWeight: 700,
  lineHeight: 1,
  fontVariantNumeric: 'tabular-nums',
  color: 'var(--color-foreground)',
}

const ABSOLUTE_INSET: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  right: 0,
}

// Top half occupies y: 0 → 50%. overflow-hidden clips the centered glyph.
export const FLIP_HALF_TOP: React.CSSProperties = {
  ...ABSOLUTE_INSET,
  top: 0,
  height: '50%',
  overflow: 'hidden',
  background: HALF_BG_TOP,
}

// Bottom half occupies y: 50% → 100%.
export const FLIP_HALF_BOTTOM: React.CSSProperties = {
  ...ABSOLUTE_INSET,
  bottom: 0,
  height: '50%',
  overflow: 'hidden',
  background: HALF_BG_BOTTOM,
}

// Inner element spans 200% of its half wrapper so the centered digit
// physically sits across the mid-line of the card — only the correct half
// shows through each clipped half wrapper.
export const FLIP_INNER_TOP: React.CSSProperties = {
  position: 'absolute',
  inset: '0 0 auto 0',
  height: '200%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

export const FLIP_INNER_BOTTOM: React.CSSProperties = {
  position: 'absolute',
  inset: 'auto 0 0 0',
  height: '200%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}

export const FLIP_HINGE: React.CSSProperties = {
  ...ABSOLUTE_INSET,
  top: '50%',
  height: 2,
  marginTop: -1,
  background: 'rgba(0, 0, 0, 0.45)',
  boxShadow: '0 1px 0 rgba(255, 255, 255, 0.04)',
  pointerEvents: 'none',
  // Above the static background halves (auto z-index) but below the
  // rotating flaps (z-index 20) so a fully-landed flap can cover it.
  zIndex: 10,
}

// Flap-specific overrides. These are merged on top of FLIP_HALF_TOP /
// FLIP_HALF_BOTTOM to add the 3D animation hooks. They inherit the half
// backgrounds above so the flap stays opaque throughout the rotation.
const FLAP_COMMON: React.CSSProperties = {
  zIndex: 20,
  backfaceVisibility: 'hidden',
  WebkitBackfaceVisibility: 'hidden',
  willChange: 'transform, filter',
  transform: 'translateZ(0)',
}

export const FLIP_FLAP_TOP: React.CSSProperties = {
  ...FLAP_COMMON,
  transformOrigin: '50% 100%',
  animationName: 'flip-card-top-fall',
  animationDuration: '280ms',
  animationTimingFunction: 'cubic-bezier(0.45, 0.05, 0.55, 0.45)',
  animationFillMode: 'forwards',
}

export const FLIP_FLAP_BOTTOM: React.CSSProperties = {
  ...FLAP_COMMON,
  transformOrigin: '50% 0%',
  animationName: 'flip-card-bottom-rise',
  animationDuration: '280ms',
  animationDelay: '280ms',
  animationTimingFunction: 'cubic-bezier(0.25, 0.8, 0.4, 1)',
  animationFillMode: 'both',
}

// Convenience for the FlipFace parent — establishes the perspective scene
// so all 6 cards share a single virtual camera depth.
export const FLIP_FACE_PERSPECTIVE: React.CSSProperties = {
  perspective: '1200px',
  perspectiveOrigin: '50% 50%',
}

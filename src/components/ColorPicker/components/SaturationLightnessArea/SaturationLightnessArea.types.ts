export interface SaturationLightnessAreaProps {
  /** Hue 0..360 — used for the area's background coloring. */
  hue: number
  /** Saturation 0..100 — used to position the indicator dot. */
  saturation: number
  /** Lightness 0..100 — used to position the indicator dot. */
  lightness: number
  /** Fired on pointer down + move. */
  onChange: (saturation: number, lightness: number) => void
}

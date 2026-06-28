import type { SaturationLightnessAreaProps } from './SaturationLightnessArea.types'
import { useSaturationLightnessAreaData } from './useSaturationLightnessAreaData'

export function SaturationLightnessArea(
  props: SaturationLightnessAreaProps,
): React.JSX.Element {
  const data = useSaturationLightnessAreaData(props)

  return (
    <div
      ref={data.containerRef}
      onPointerDown={data.onPointerDown}
      onPointerMove={data.onPointerMove}
      onPointerUp={data.onPointerUp}
      className="relative w-full h-[140px] rounded-md overflow-hidden border border-border/40 cursor-crosshair touch-none select-none"
      style={{ background: data.background }}
      role="slider"
      aria-label="Saturation and lightness"
      aria-valuetext={`saturation ${props.saturation}%, lightness ${props.lightness}%`}
    >
      <div
        className="absolute size-3 rounded-full border-2 border-white -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          left: data.indicatorLeft,
          top: data.indicatorTop,
          backgroundColor: data.indicatorBackground,
          boxShadow: '0 0 0 1px rgba(0,0,0,0.5)',
        }}
      />
    </div>
  )
}

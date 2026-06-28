import type { HueSliderProps } from './HueSlider.types'
import { HUE_SLIDER_BACKGROUND, useHueSliderData } from './useHueSliderData'

export function HueSlider(props: HueSliderProps): React.JSX.Element {
  const data = useHueSliderData(props)

  return (
    <div
      ref={data.containerRef}
      onPointerDown={data.onPointerDown}
      onPointerMove={data.onPointerMove}
      onPointerUp={data.onPointerUp}
      className="relative w-full h-3 rounded-full cursor-pointer touch-none select-none"
      style={{ background: HUE_SLIDER_BACKGROUND }}
      role="slider"
      aria-label="Hue"
      aria-valuemin={0}
      aria-valuemax={360}
      aria-valuenow={props.hue}
    >
      <div
        className="absolute top-1/2 size-4 rounded-full border-2 border-white -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{
          left: data.thumbLeft,
          backgroundColor: data.thumbBackground,
          boxShadow: '0 0 0 1px rgba(0,0,0,0.5)',
        }}
      />
    </div>
  )
}

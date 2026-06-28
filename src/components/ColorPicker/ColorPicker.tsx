import type { ColorPickerProps } from './ColorPicker.types'
import { HueSlider } from './components/HueSlider'
import { SaturationLightnessArea } from './components/SaturationLightnessArea'
import { useColorPickerData } from './useColorPickerData'

export function ColorPicker(props: ColorPickerProps): React.JSX.Element {
  const data = useColorPickerData(props)

  return (
    <div className="flex flex-col gap-3 w-[220px] select-none">
      <SaturationLightnessArea
        hue={data.hue}
        saturation={data.saturation}
        lightness={data.lightness}
        onChange={data.handleSaturationLightnessChange}
      />
      <HueSlider hue={data.hue} onChange={data.handleHueChange} />
    </div>
  )
}

import { AlignCenter, AlignLeft, AlignRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import type {
  ElementAnimation,
  ElementAnimationType,
  TextAlign,
  TextElement,
} from '@/store/webpoint-store/types'

import { inspectorStyles } from '../../inspector.styles'
import { InspectorColor } from '../InspectorColor'
import { InspectorNumber } from '../InspectorNumber'
import { InspectorSelect } from '../InspectorSelect'
import type { TextControlsProps } from './TextControls.types'

const WEIGHTS = [
  { label: 'Light', value: '300' },
  { label: 'Regular', value: '400' },
  { label: 'Medium', value: '500' },
  { label: 'Semibold', value: '600' },
  { label: 'Bold', value: '700' },
  { label: 'Black', value: '800' },
]

const ANIMATIONS = [
  { label: 'None', value: 'none' },
  { label: 'Fade', value: 'fade' },
  { label: 'Slide up', value: 'slide-up' },
  { label: 'Slide down', value: 'slide-down' },
  { label: 'Slide left', value: 'slide-left' },
  { label: 'Slide right', value: 'slide-right' },
  { label: 'Zoom', value: 'zoom' },
  { label: 'Bounce', value: 'bounce' },
]

const ALIGNS: { value: TextAlign; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'left', icon: AlignLeft },
  { value: 'center', icon: AlignCenter },
  { value: 'right', icon: AlignRight },
]

const DEFAULT_ANIMATION: ElementAnimation = { type: 'none', duration: 500, delay: 0 }

export function TextControls(props: TextControlsProps): React.JSX.Element {
  const { element, onChange } = props
  const { style } = element

  const setStyle = (patch: Partial<TextElement['style']>): void => {
    onChange({ ...element, style: { ...style, ...patch } })
  }
  const setAnimation = (patch: Partial<ElementAnimation>): void => {
    onChange({ ...element, animation: { ...(element.animation ?? DEFAULT_ANIMATION), ...patch } })
  }

  return (
    <div className={inspectorStyles.section}>
      <span className={inspectorStyles.sectionTitle}>Text</span>
      <textarea
        value={element.content}
        onChange={(e) => onChange({ ...element, content: e.target.value })}
        rows={2}
        className={cn(inspectorStyles.input, 'h-auto resize-none py-1.5')}
      />
      <InspectorColor label="Color" value={style.color} onChange={(color) => setStyle({ color })} />
      <InspectorNumber
        label="Font size"
        value={style.fontSize}
        min={8}
        max={400}
        onChange={(fontSize) => setStyle({ fontSize })}
      />
      <div className={inspectorStyles.label}>
        <span>Align</span>
        <div className="flex gap-1">
          {ALIGNS.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.value}
                type="button"
                aria-label={item.value}
                onClick={() => setStyle({ textAlign: item.value })}
                className={cn(
                  inspectorStyles.iconButton,
                  style.textAlign === item.value && inspectorStyles.iconButtonActive
                )}
              >
                <Icon className="size-3.5" />
              </button>
            )
          })}
        </div>
      </div>
      <InspectorSelect
        label="Weight"
        value={String(style.fontWeight)}
        options={WEIGHTS}
        onChange={(v) => setStyle({ fontWeight: Number(v) })}
      />
      <InspectorSelect
        label="Animation"
        value={element.animation?.type ?? 'none'}
        options={ANIMATIONS}
        onChange={(v) => setAnimation({ type: v as ElementAnimationType })}
      />
      <InspectorNumber
        label="Duration (ms)"
        value={element.animation?.duration ?? 500}
        step={100}
        min={0}
        onChange={(duration) => setAnimation({ duration })}
      />
    </div>
  )
}

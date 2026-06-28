import { Square, Type } from 'lucide-react'

import { GRADIENT_PRESETS, SOLID_PRESETS } from '@/lib/webpoint/backgroundPresets'
import { createShapeElement } from '@/lib/webpoint/createShapeElement'
import { createTextElement } from '@/lib/webpoint/createTextElement'
import { slideBackgroundToCss } from '@/lib/webpoint/slideBackgroundToCss'
import { cn } from '@/lib/utils'
import type { SlideTransition } from '@/store/webpoint-store/types'

import { inspectorStyles } from '../../inspector.styles'
import { InspectorSelect } from '../InspectorSelect'
import type { SlideInspectorProps } from './SlideInspector.types'

const TRANSITIONS = [
  { label: 'None', value: 'none' },
  { label: 'Fade', value: 'fade' },
  { label: 'Slide', value: 'slide' },
  { label: 'Zoom', value: 'zoom' },
  { label: 'Flip', value: 'flip' },
]

export function SlideInspector(props: SlideInspectorProps): React.JSX.Element {
  const { slide, onAddElement, onChangeBackground, onChangeTransition, onChangeNotes } = props

  return (
    <div className="flex flex-col">
      <div className={inspectorStyles.section}>
        <span className={inspectorStyles.sectionTitle}>Add</span>
        <div className="flex gap-2">
          <button type="button" onClick={() => onAddElement(createTextElement())} className={inspectorStyles.addButton}>
            <Type className="size-3.5" />
            Text
          </button>
          <button type="button" onClick={() => onAddElement(createShapeElement())} className={inspectorStyles.addButton}>
            <Square className="size-3.5" />
            Shape
          </button>
        </div>
      </div>
      <div className={inspectorStyles.section}>
        <span className={inspectorStyles.sectionTitle}>Background</span>
        <div className="grid grid-cols-5 gap-2">
          {SOLID_PRESETS.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={color}
              onClick={() => onChangeBackground({ type: 'solid', color })}
              className="aspect-square rounded-md border border-border/60"
              style={{ background: color }}
            />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {GRADIENT_PRESETS.map((background) => {
            const css = slideBackgroundToCss(background)
            return (
              <button
                key={css}
                type="button"
                aria-label="Gradient preset"
                onClick={() => onChangeBackground(background)}
                className="aspect-video rounded-md border border-border/60"
                style={{ background: css }}
              />
            )
          })}
        </div>
      </div>
      <div className={inspectorStyles.section}>
        <span className={inspectorStyles.sectionTitle}>Transition</span>
        <InspectorSelect
          label="Type"
          value={slide.data.transition}
          options={TRANSITIONS}
          onChange={(v) => onChangeTransition(v as SlideTransition)}
        />
      </div>
      <div className={inspectorStyles.section}>
        <span className={inspectorStyles.sectionTitle}>Speaker notes</span>
        <textarea
          value={slide.notes}
          onChange={(e) => onChangeNotes(e.target.value)}
          rows={3}
          placeholder="Notes shown in present mode…"
          className={cn(inspectorStyles.input, 'h-auto resize-none py-1.5')}
        />
      </div>
    </div>
  )
}

import { Trash2 } from 'lucide-react'

import type { SlideElement } from '@/store/webpoint-store/types'

import { inspectorStyles } from '../../inspector.styles'
import { InspectorNumber } from '../InspectorNumber'
import { ShapeControls } from '../ShapeControls'
import { TextControls } from '../TextControls'
import type { ElementInspectorProps } from './ElementInspector.types'

const TYPE_LABEL: Record<SlideElement['type'], string> = {
  text: 'Text',
  shape: 'Shape',
  image: 'Image',
}

export function ElementInspector(props: ElementInspectorProps): React.JSX.Element {
  const { element, onChange, onDelete } = props

  const setGeometry = (patch: Partial<{ x: number; y: number; w: number; h: number }>): void => {
    onChange({ ...element, ...patch } as SlideElement)
  }

  let typeControls: React.ReactNode = null
  if (element.type === 'text') {
    typeControls = <TextControls element={element} onChange={onChange} />
  } else if (element.type === 'shape') {
    typeControls = <ShapeControls element={element} onChange={onChange} />
  }

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between p-3">
        <span className="text-sm font-medium">{TYPE_LABEL[element.type]}</span>
        <button type="button" onClick={() => onDelete(element.id)} className={inspectorStyles.dangerButton}>
          <Trash2 className="size-3.5" />
          Delete
        </button>
      </div>
      <div className={inspectorStyles.section}>
        <span className={inspectorStyles.sectionTitle}>Position</span>
        <div className="grid grid-cols-2 gap-x-3 gap-y-2">
          <InspectorNumber label="X" value={Math.round(element.x)} onChange={(x) => setGeometry({ x })} />
          <InspectorNumber label="Y" value={Math.round(element.y)} onChange={(y) => setGeometry({ y })} />
          <InspectorNumber label="W" value={Math.round(element.w)} onChange={(w) => setGeometry({ w })} />
          <InspectorNumber label="H" value={Math.round(element.h)} onChange={(h) => setGeometry({ h })} />
        </div>
      </div>
      {typeControls}
    </div>
  )
}

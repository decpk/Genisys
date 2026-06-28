import type { ShapeElement } from '@/store/webpoint-store/types'

import { inspectorStyles } from '../../inspector.styles'
import { InspectorColor } from '../InspectorColor'
import { InspectorNumber } from '../InspectorNumber'
import type { ShapeControlsProps } from './ShapeControls.types'

export function ShapeControls(props: ShapeControlsProps): React.JSX.Element {
  const { element, onChange } = props
  const { style } = element

  const setStyle = (patch: Partial<ShapeElement['style']>): void => {
    onChange({ ...element, style: { ...style, ...patch } })
  }

  return (
    <div className={inspectorStyles.section}>
      <span className={inspectorStyles.sectionTitle}>Shape</span>
      <InspectorColor label="Fill" value={style.fill} onChange={(fill) => setStyle({ fill })} />
      <InspectorNumber
        label="Radius"
        value={style.borderRadius ?? 0}
        min={0}
        onChange={(borderRadius) => setStyle({ borderRadius })}
      />
      <InspectorNumber
        label="Opacity %"
        value={Math.round((style.opacity ?? 1) * 100)}
        min={0}
        max={100}
        onChange={(v) => setStyle({ opacity: v / 100 })}
      />
    </div>
  )
}

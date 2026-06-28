import type { TransformAction } from '../../utils/ai-transform'

export interface TransformMenuProps {
  text: string
  onTransformComplete: (result: string) => void
}

export interface TransformGroup {
  label: string
  actions: TransformAction[]
}

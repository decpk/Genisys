import { TimerCard } from '../../../TimerCard'
import { TimerEmptyState } from '../FocusView/components/TimerEmptyState'

import type { GridViewProps } from './GridView.types'

const ROOT_CLASS = 'grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6 p-6'

export function GridView(props: GridViewProps): React.JSX.Element {
  const { instances } = props
  if (instances.length === 0) return <TimerEmptyState />
  return (
    <div className={ROOT_CLASS}>
      {instances.map((inst) => (
        <TimerCard key={inst.id} instance={inst} view="grid" />
      ))}
    </div>
  )
}

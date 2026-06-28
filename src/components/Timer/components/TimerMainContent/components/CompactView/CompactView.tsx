import { TimerCard } from '../../../TimerCard'
import { TimerEmptyState } from '../FocusView/components/TimerEmptyState'

import type { CompactViewProps } from './CompactView.types'

const ROOT_CLASS = 'flex flex-col gap-2 p-4 max-w-3xl mx-auto'

export function CompactView(props: CompactViewProps): React.JSX.Element {
  const { instances } = props
  if (instances.length === 0) return <TimerEmptyState />
  return (
    <div className={ROOT_CLASS}>
      {instances.map((inst) => (
        <TimerCard key={inst.id} instance={inst} view="compact" />
      ))}
    </div>
  )
}

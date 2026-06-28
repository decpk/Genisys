import { memo } from 'react'
import { Plus } from 'lucide-react'

import { useAgendaAddTaskData } from './hooks/useAgendaAddTaskData'
import { AGENDA_ADD_TASK_STYLES as s } from './AgendaAddTask.styles'
import type { AgendaAddTaskProps } from './AgendaAddTask.types'

/**
 * Inline quick-add composer pinned at the bottom of the Today's Agenda tile.
 * Type a title and press Enter to create a task scheduled for today.
 */
export const AgendaAddTask = memo(function AgendaAddTask(
  props: AgendaAddTaskProps
): React.JSX.Element {
  const { onAdd } = props
  const { value, handleChange, handleSubmit } = useAgendaAddTaskData(onAdd)

  return (
    <form className={s.form} onSubmit={handleSubmit}>
      <Plus size={14} className={s.icon} />
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder="Add a task…"
        aria-label="Add a task for today"
        className={s.input}
      />
    </form>
  )
})

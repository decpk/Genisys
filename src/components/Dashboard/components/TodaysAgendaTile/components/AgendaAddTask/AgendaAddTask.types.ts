/**
 * Props for the inline quick-add-task composer in the Today's Agenda tile.
 */
export interface AgendaAddTaskProps {
  /** Called with the trimmed, non-empty title when the user submits. */
  onAdd: (title: string) => void | Promise<void>
}

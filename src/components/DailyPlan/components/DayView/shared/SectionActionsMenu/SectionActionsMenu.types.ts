export type MoveScopeKey = 'all' | 'incomplete' | 'completed'
export type MoveMode = 'tomorrow' | 'pick'

export interface SectionActionsMenuProps<T> {
  /** All items currently shown in the section. */
  items: T[]
  /** Singular noun, e.g. 'task' | 'meeting' | 'review'. */
  itemNoun: string
  /** Section title for dialog copy, e.g. 'Meetings'. */
  sectionTitle: string
  /** Pure builder returning a copy of item with scheduledDate = targetDate. */
  moveItem: (item: T, targetDate: string) => T
  /** Store action that persists/re-buckets the item. */
  saveItem: (item: T) => void | Promise<void>
  /** Optional completion predicate; enables incomplete/completed scopes. */
  getIsCompleted?: (item: T) => boolean
}

export interface MoveScopeDescriptor<T> {
  key: MoveScopeKey
  /** Menu label, e.g. 'Move all', 'Move incomplete', 'Move completed'. */
  label: string
  items: T[]
}

export interface PendingMove<T> {
  items: T[]
  mode: MoveMode
}

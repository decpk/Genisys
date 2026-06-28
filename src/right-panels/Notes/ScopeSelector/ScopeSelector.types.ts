import type { NoteScopeOption } from '../Notes.types'

export interface ScopeSelectorProps {
  scopes: NoteScopeOption[]
  activeScope: NoteScopeOption
  onScopeChange: (scope: NoteScopeOption) => void
}

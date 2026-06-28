import { promptPickerStyles } from '../../PromptPicker.styles'

export interface PromptPickerEmptyStateProps {
  hasQuery: boolean
  isLoaded: boolean
}

export function PromptPickerEmptyState(props: PromptPickerEmptyStateProps): React.JSX.Element {
  const { hasQuery, isLoaded } = props
  let message = 'No prompts available for this app yet.'
  if (!isLoaded) message = 'Loading prompts…'
  else if (hasQuery) message = 'No prompts match your search.'
  return <div className={promptPickerStyles.emptyState}>{message}</div>
}

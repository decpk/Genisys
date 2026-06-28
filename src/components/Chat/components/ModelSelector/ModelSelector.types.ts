export type ModelProvider = 'openai' | 'anthropic' | 'google'

export interface ModelOption {
  id: string
  label: string
  description: string
  provider: ModelProvider
}

export interface ModelGroup {
  provider: ModelProvider
  label: string
  models: ModelOption[]
}

/**
 * Visual variant for the dropdown trigger button.
 * - `icon`: compact icon-only button (default — used in chat input toolbars).
 * - `pill`: provider icon + model label + chevron (used in form rows / inspectors).
 */
export type ModelSelectorTrigger = 'icon' | 'pill'

export interface ModelSelectorProps {
  selectedModelId: string
  onModelChange: (modelId: string) => void
  /** Visual style for the trigger button. Defaults to `'icon'`. */
  trigger?: ModelSelectorTrigger
}

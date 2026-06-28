export type FeaturePriority = 'low' | 'medium' | 'high'

export type FeatureCategory =
  | 'new-app'
  | 'app-improvement'
  | 'ui-ux'
  | 'performance'
  | 'ai-assistant'
  | 'other'

export interface FeatureRequestOption<T extends string> {
  value: T
  label: string
}

export interface FeatureRequestFormState {
  title: string
  category: FeatureCategory
  priority: FeaturePriority
  problem: string
  description: string
  expectedBehavior: string
  email: string
}

export interface UseFeatureRequestData {
  form: FeatureRequestFormState
  canSubmit: boolean
  emailLocked: boolean
  setTitle: (value: string) => void
  setCategory: (value: FeatureCategory) => void
  setPriority: (value: FeaturePriority) => void
  setProblem: (value: string) => void
  setDescription: (value: string) => void
  setExpectedBehavior: (value: string) => void
  setEmail: (value: string) => void
  reset: () => void
  handleSubmit: () => void
}

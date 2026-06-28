import type {
  FeatureCategory,
  FeaturePriority,
  FeatureRequestFormState,
  FeatureRequestOption,
} from './FeatureRequest.types'

export const PRIORITY_OPTIONS: FeatureRequestOption<FeaturePriority>[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export const CATEGORY_OPTIONS: FeatureRequestOption<FeatureCategory>[] = [
  { value: 'new-app', label: 'New app idea' },
  { value: 'app-improvement', label: 'Existing app improvement' },
  { value: 'ui-ux', label: 'UI / UX' },
  { value: 'performance', label: 'Performance' },
  { value: 'ai-assistant', label: 'AI Assistant' },
  { value: 'other', label: 'Other' },
]

export const INITIAL_FEATURE_REQUEST: FeatureRequestFormState = {
  title: '',
  category: 'new-app',
  priority: 'medium',
  problem: '',
  description: '',
  expectedBehavior: '',
  email: '',
}

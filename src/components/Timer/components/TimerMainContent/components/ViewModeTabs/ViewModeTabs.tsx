import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import type { TimerView } from '../../TimerMainContent.types'
import type { ViewModeTabsProps } from './ViewModeTabs.types'

const VIEWS: { value: TimerView; label: string }[] = [
  { value: 'focus', label: 'Focus' },
  { value: 'grid', label: 'Grid' },
  { value: 'compact', label: 'Compact' },
]

export function ViewModeTabs(props: ViewModeTabsProps): React.JSX.Element {
  const { value, onChange } = props
  const handleChange = (v: string) => onChange(v as TimerView)
  return (
    <Tabs value={value} onValueChange={handleChange}>
      <TabsList>
        {VIEWS.map((v) => (
          <TabsTrigger key={v.value} value={v.value}>{v.label}</TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

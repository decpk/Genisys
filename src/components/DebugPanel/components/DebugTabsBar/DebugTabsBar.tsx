import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import type { DebugTabsBarProps } from './DebugTabsBar.types'

export function DebugTabsBar(props: DebugTabsBarProps): React.JSX.Element {
  const { tabs, activeTab, onTabChange } = props

  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      <TabsList>
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <TabsTrigger key={tab.id} value={tab.id} className="gap-1.5">
              <Icon size={12} />
              {tab.label}
            </TabsTrigger>
          )
        })}
      </TabsList>
    </Tabs>
  )
}

import { Zap } from 'lucide-react'

import { MainEmptyState } from '@/components/ui/main-empty-state'

export function AutoflowMain(): React.JSX.Element {
  return (
    <MainEmptyState
      icon={Zap}
      title="Autoflow"
      description="Coming soon"
      hint="This feature is under development"
      className="flex-1"
    />
  )
}

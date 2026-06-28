import { Clock, Zap } from 'lucide-react'

import { PanelHeading } from '@/components/ui/panel-heading'
import { EmptyState } from '@/components/ui/empty-state'

export function AutoflowSidebar(): React.JSX.Element {
  return (
    <>
      <PanelHeading icon={Clock} title="Autoflow History" className="px-3 h-12 border-b border-border/40" />

      <div className="flex-1 overflow-y-auto px-1.5 pb-2">
        <EmptyState icon={Zap} message="No history yet" className="py-12" />
      </div>
    </>
  )
}

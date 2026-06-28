import { AppShell } from '@/components/AppShell'

import { AutoflowMain } from './components/AutoflowMain'
import { AutoflowSidebar } from './components/AutoflowSidebar'

export function Autoflow(): React.JSX.Element {
  return (
    <AppShell appId="autoflow" sidebar={<AutoflowSidebar />}>
      <AutoflowMain />
    </AppShell>
  )
}

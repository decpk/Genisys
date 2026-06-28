import { AppShell } from '@/components/AppShell'
import { AppShellLoader } from '@/components/AppLoader/AppShellLoader'

import { PromptsAppContent } from './components/PromptsAppContent'
import { PromptsAppDialogs } from './components/PromptsAppDialogs'
import { PromptsAppSidebar } from './components/PromptsAppSidebar'
import { usePromptsAppData } from './hooks/usePromptsAppData'

export function PromptsApp(): React.JSX.Element {
  const data = usePromptsAppData()

  if (!data.isLoaded) {
    return <AppShellLoader />
  }

  return (
    <AppShell appId="prompts" sidebar={<PromptsAppSidebar data={data} />}>
      <PromptsAppContent data={data} />
      <PromptsAppDialogs data={data} />
    </AppShell>
  )
}

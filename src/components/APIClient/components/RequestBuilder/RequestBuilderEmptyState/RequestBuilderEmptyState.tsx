import { Globe, Plus } from 'lucide-react'
import { MainEmptyState } from '@/components/ui/main-empty-state'
import { Button } from '@/components/ui/button'
import { AppLoaderGlyph } from '@/components/AppLoader'
import { useRequestBuilderEmptyStateData } from './useRequestBuilderEmptyStateData'

export function RequestBuilderEmptyState(): React.JSX.Element {
  const { creating, handleCreateRequest } = useRequestBuilderEmptyStateData()

  let icon = <Plus size={14} />
  if (creating) icon = <AppLoaderGlyph size={14} />

  return (
    <MainEmptyState
      icon={Globe}
      title="API Client"
      description="Create a request to get started — no collection needed"
      hint="Paste a cURL command into the URL bar to auto-fill a request"
    >
      <Button
        onClick={handleCreateRequest}
        disabled={creating}
        className="gap-1.5 h-8 px-4 text-xs font-semibold rounded-lg"
      >
        {icon}
        New Request
      </Button>
    </MainEmptyState>
  )
}

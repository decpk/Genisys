import { FolderOpen } from 'lucide-react'

import { MainEmptyState } from '@/components/ui/main-empty-state'

export function NoFolderSelectedState(): React.JSX.Element {
  return (
    <MainEmptyState
      icon={FolderOpen}
      title="Start Exploring"
      description="Pick a repository from the sidebar to browse files, review changes, and navigate your codebase."
      hint="Select a repository from the sidebar"
    />
  )
}

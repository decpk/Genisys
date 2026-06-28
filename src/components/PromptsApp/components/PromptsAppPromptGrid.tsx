import { PromptsAppPromptCard } from './PromptsAppPromptCard'
import type { PromptsAppData } from '../PromptsApp.types'

interface PromptsAppPromptGridProps {
  data: PromptsAppData
}

export function PromptsAppPromptGrid(
  props: PromptsAppPromptGridProps,
): React.JSX.Element {
  const { data } = props
  return (
    <div className="grid grid-cols-1 gap-4 px-6 pb-10 pt-5 md:grid-cols-2 xl:grid-cols-3">
      {data.filteredPrompts.map((prompt) => (
        <PromptsAppPromptCard key={prompt.id} prompt={prompt} data={data} />
      ))}
    </div>
  )
}

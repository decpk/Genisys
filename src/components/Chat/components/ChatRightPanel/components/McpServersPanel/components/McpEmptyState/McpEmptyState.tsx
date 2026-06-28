import { Settings } from 'lucide-react'

export function McpEmptyState(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center mb-3">
        <Settings size={18} className="text-muted-foreground" />
      </div>
      <p className="text-sm font-medium text-muted-foreground mb-1">
        No MCP servers configured
      </p>
      <p className="text-xs text-muted-foreground/70 max-w-[200px]">
        Add MCP servers in Settings → Chat to enable tool integrations.
      </p>
    </div>
  )
}

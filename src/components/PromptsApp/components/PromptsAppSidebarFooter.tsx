import { FolderPlus, Import } from 'lucide-react'

interface PromptsAppSidebarFooterProps {
  onNewFolder: () => void
  onImport: () => void
}

export function PromptsAppSidebarFooter(
  props: PromptsAppSidebarFooterProps,
): React.JSX.Element {
  const { onNewFolder, onImport } = props
  return (
    <div className="border-t border-border/40 bg-card/50 px-3 py-3 backdrop-blur-md">
      <button
        type="button"
        onClick={onNewFolder}
        className="flex w-full items-center gap-2 rounded-xl border border-dashed border-border/60 px-3 py-2 text-left text-[12.5px] font-medium text-muted-foreground transition-all hover:border-primary/50 hover:bg-primary/5 hover:text-foreground cursor-pointer"
      >
        <FolderPlus size={14} className="shrink-0" />
        <span className="flex-1 truncate">New collection</span>
      </button>
      <button
        type="button"
        onClick={onImport}
        className="mt-1.5 flex w-full items-center gap-2 rounded-xl px-3 py-1.5 text-left text-[11.5px] text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground cursor-pointer"
      >
        <Import size={12} className="shrink-0" />
        <span className="flex-1 truncate">Import shared prompt…</span>
      </button>
    </div>
  )
}

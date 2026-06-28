import { ThemePreviewSidebarItem } from './components/ThemePreviewSidebarItem'

export function ThemePreviewSidebar(): React.JSX.Element {
  return (
    <aside
      className="w-[120px] shrink-0 border-r flex flex-col"
      style={{
        backgroundColor: 'var(--color-sidebar)',
        color: 'var(--color-sidebar-foreground)',
        borderColor: 'var(--color-sidebar-border)',
      }}
    >
      <div
        className="h-7 flex items-center px-3 text-[9px] font-semibold uppercase tracking-wider"
        style={{ color: 'var(--color-sidebar-muted-foreground)' }}
      >
        Workspace
      </div>
      <ul className="flex flex-col gap-px px-1 pb-2">
        <ThemePreviewSidebarItem label="Dashboard" active={false} />
        <ThemePreviewSidebarItem label="Notes" active={true} />
        <ThemePreviewSidebarItem label="Library" active={false} />
        <ThemePreviewSidebarItem label="Clipboard" active={false} />
      </ul>
      <div
        className="mt-auto px-3 py-2 text-[9px]"
        style={{ color: 'var(--color-sidebar-muted-foreground)' }}
      >
        v1.0 · ready
      </div>
    </aside>
  )
}

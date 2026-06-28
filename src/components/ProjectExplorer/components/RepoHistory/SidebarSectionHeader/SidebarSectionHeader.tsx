import type { SidebarSectionHeaderProps } from './SidebarSectionHeader.types'

export function SidebarSectionHeader(
  props: SidebarSectionHeaderProps
): React.JSX.Element {
  const { label, count } = props

  let countNode: React.ReactNode = null
  if (count !== undefined && count > 0) {
    countNode = (
      <span className="text-[10px] tabular-nums font-medium text-muted-foreground/40">
        {count}
      </span>
    )
  }

  return (
    <div className="flex items-center justify-between px-2 pt-3 pb-1 select-none">
      <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/70 truncate">
        {label}
      </span>
      {countNode}
    </div>
  )
}

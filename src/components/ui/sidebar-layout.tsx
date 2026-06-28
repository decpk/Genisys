import type { SidebarPosition } from '@/store/settings-store'

interface SidebarLayoutProps {
  sidebarPosition: SidebarPosition
  sidebar: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function SidebarLayout({
  sidebarPosition,
  sidebar,
  children,
  className = 'flex h-full'
}: SidebarLayoutProps): React.JSX.Element {
  return (
    <div className={className}>
      {sidebarPosition === 'right' ? (
        <>
          <div className="flex-1 min-w-0 h-full">{children}</div>
          {sidebar}
        </>
      ) : (
        <>
          {sidebar}
          <div className="flex-1 min-w-0 h-full">{children}</div>
        </>
      )}
    </div>
  )
}

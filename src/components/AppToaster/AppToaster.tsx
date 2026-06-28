import { Toaster } from 'sonner'

export function AppToaster(): React.JSX.Element {
  return (
    <Toaster
      position="top-right"
      theme="system"
      expand
      visibleToasts={Infinity}
      duration={6000}
      gap={6}
      offset={{ top: 10, right: 10 }}
      toastOptions={{
        style: {
          background: 'var(--color-sidebar)',
          color: 'var(--color-sidebar-foreground)',
          border: '1px solid var(--color-sidebar-border)',
        },
        classNames: {
          toast: 'sonner-default-toast',
        },
      }}
    />
  )
}

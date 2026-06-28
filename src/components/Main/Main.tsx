export function Main({ children }: { children: React.ReactNode }): React.JSX.Element {
  return (
    <main
      data-genisys-main
      className="relative flex-1 min-h-0 h-full overflow-hidden bg-background"
    >
      {children}
    </main>
  )
}

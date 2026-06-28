interface ResponseHeadersProps {
  headers: Record<string, string>
}

export function ResponseHeaders(props: ResponseHeadersProps): React.JSX.Element {
  const { headers } = props
  const entries = Object.entries(headers)

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-muted-foreground/50">
        No response headers
      </div>
    )
  }

  return (
    <div className="text-xs">
      <div className="flex items-center gap-1 px-3 py-1.5 border-b border-border/30 sticky -top-px bg-background z-10">
        <div className="w-1/3 text-2xs uppercase tracking-wider text-muted-foreground/60 font-medium">Name</div>
        <div className="flex-1 text-2xs uppercase tracking-wider text-muted-foreground/60 font-medium">Value</div>
      </div>
      {entries.map(([key, value], index) => (
        <div key={key} className={`flex items-center gap-1 px-3 py-1.5 hover:bg-muted/20 border-b border-border/[0.08] ${index % 2 === 1 ? 'bg-muted/[0.03]' : ''}`}>
          <div className="w-1/3 shrink-0 min-h-[22px] flex items-center font-medium text-foreground break-all">{key}</div>
          <div className="flex-1 min-h-[22px] flex items-center text-muted-foreground font-sans break-all">{value}</div>
        </div>
      ))}
    </div>
  )
}

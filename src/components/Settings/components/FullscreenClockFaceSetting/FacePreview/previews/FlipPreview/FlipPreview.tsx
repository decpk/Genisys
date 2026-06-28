const DIGITS = ['1', '2']

export function FlipPreview(): React.JSX.Element {
  return (
    <div className="flex gap-1 items-center">
      {DIGITS.map((d) => (
        <div
          key={d}
          className="relative w-5 h-7 rounded-sm bg-foreground/10 border border-border flex items-center justify-center text-[0.7rem] font-bold tabular-nums text-foreground overflow-hidden"
        >
          <div className="absolute inset-x-0 top-1/2 h-px bg-border/70" />
          {d}
        </div>
      ))}
    </div>
  )
}

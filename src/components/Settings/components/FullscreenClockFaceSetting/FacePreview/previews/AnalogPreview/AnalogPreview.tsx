export function AnalogPreview(): React.JSX.Element {
  return (
    <svg viewBox="0 0 100 100" className="w-12 h-12 text-foreground">
      <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeOpacity="0.4" strokeWidth="2" />
      <line x1="50" y1="50" x2="50" y2="22" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="50" x2="74" y2="50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="50" cy="50" r="3" fill="currentColor" />
    </svg>
  )
}

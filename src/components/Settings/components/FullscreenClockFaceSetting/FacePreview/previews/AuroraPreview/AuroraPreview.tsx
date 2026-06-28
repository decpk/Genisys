const AURORA_STYLE: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(120deg, #f472b6, #c084fc, #60a5fa, #34d399, #fbbf24, #f472b6)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  color: 'transparent',
}

export function AuroraPreview(): React.JSX.Element {
  return (
    <div className="text-lg font-bold tabular-nums" style={AURORA_STYLE}>
      12:34
    </div>
  )
}

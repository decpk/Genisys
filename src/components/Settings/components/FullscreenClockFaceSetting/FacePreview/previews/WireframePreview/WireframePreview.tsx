const WIREFRAME_STYLE: React.CSSProperties = {
  color: 'transparent',
  WebkitTextStrokeWidth: '1px',
  WebkitTextStrokeColor: 'var(--color-foreground)',
}

export function WireframePreview(): React.JSX.Element {
  return (
    <div className="text-lg font-bold tabular-nums" style={WIREFRAME_STYLE}>
      12:34
    </div>
  )
}

const NEON_GLOW = '0 0 6px currentColor, 0 0 12px currentColor'

export function NeonPreview(): React.JSX.Element {
  return (
    <div
      className="text-lg font-light tabular-nums text-primary"
      style={{ textShadow: NEON_GLOW }}
    >
      12:34
    </div>
  )
}

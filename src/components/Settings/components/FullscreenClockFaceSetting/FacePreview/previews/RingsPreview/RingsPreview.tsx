export function RingsPreview(): React.JSX.Element {
  return (
    <svg viewBox="0 0 100 100" className="w-12 h-12 text-foreground">
      <g transform="rotate(-90 50 50)">
        <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2.5" />
        <circle
          cx="50"
          cy="50"
          r="44"
          fill="none"
          className="text-primary"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray="180 100"
        />
        <circle cx="50" cy="50" r="32" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="2" />
        <circle
          cx="50"
          cy="50"
          r="32"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.7"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="120 80"
        />
      </g>
      <text x="50" y="56" textAnchor="middle" fontSize="14" fontWeight="300" fill="currentColor">
        12
      </text>
    </svg>
  )
}

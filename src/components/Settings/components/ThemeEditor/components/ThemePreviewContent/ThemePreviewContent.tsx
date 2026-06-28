import { ThemePreviewBadgeRow } from '../ThemePreviewBadgeRow'

export function ThemePreviewContent(): React.JSX.Element {
  return (
    <main
      className="flex-1 min-h-0 overflow-hidden p-4 flex flex-col gap-3"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <h2
        className="text-sm font-semibold leading-none"
        style={{ color: 'var(--color-foreground)' }}
      >
        Welcome back, Tess
      </h2>
      <p
        className="text-[11px] leading-relaxed"
        style={{ color: 'var(--color-muted-foreground)' }}
      >
        Quick capture, deep work, and review — all in one place. The lazy{' '}
        <span
          className="px-1 py-0.5 rounded text-[10px] font-mono"
          style={{
            backgroundColor: 'var(--color-muted)',
            color: 'var(--color-foreground)',
          }}
        >
          npm run dev
        </span>{' '}
        loop is humming.
      </p>

      <div
        className="rounded-md p-2.5 text-[10px] font-mono leading-relaxed border"
        style={{
          backgroundColor: 'var(--color-card)',
          color: 'var(--color-card-foreground)',
          borderColor: 'var(--color-border)',
        }}
      >
        <span style={{ color: 'var(--color-muted-foreground)' }}># Today</span>
        <br />
        <span style={{ color: 'var(--color-primary)' }}>const</span>{' '}
        focus = <span style={{ color: 'var(--color-success)' }}>"deep work"</span>
      </div>

      <ThemePreviewBadgeRow />

      <input
        type="text"
        defaultValue="Search…"
        readOnly
        className="h-7 px-2 rounded-md text-[11px] outline-none border"
        style={{
          backgroundColor: 'var(--color-card)',
          color: 'var(--color-card-foreground)',
          borderColor: 'var(--color-input)',
          boxShadow: '0 0 0 1.5px var(--color-ring)',
        }}
      />
    </main>
  )
}

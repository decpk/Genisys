import { CopyLine } from '../CopyLine'

export function WindowsInstructions(): React.JSX.Element {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Ensure VS Code is in your system PATH. During installation, check{' '}
        <strong>"Add to PATH"</strong>. Or manually add:
      </p>
      <CopyLine text="C:\\Users\\<YOU>\\AppData\\Local\\Programs\\Microsoft VS Code\\bin" />
      <p className="text-sm text-muted-foreground">
        Then restart your terminal.
      </p>
    </div>
  )
}

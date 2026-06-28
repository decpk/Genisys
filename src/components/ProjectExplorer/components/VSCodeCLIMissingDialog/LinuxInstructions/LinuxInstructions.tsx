import { CopyLine } from '../CopyLine'

export function LinuxInstructions(): React.JSX.Element {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        Create a symlink to the VS Code binary:
      </p>
      <CopyLine text="sudo ln -s /usr/share/code/bin/code /usr/local/bin/code" />
      <p className="text-sm text-muted-foreground">
        Or if installed via snap:
      </p>
      <CopyLine text="sudo ln -s /snap/code/current/usr/share/code/bin/code /usr/local/bin/code" />
    </div>
  )
}

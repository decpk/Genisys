import { CopyLine } from '../CopyLine'

export function MacInstructions(): React.JSX.Element {
  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">1. Open VS Code</p>
      <p className="text-sm text-muted-foreground">
        2. Press{" "}
        <kbd className="text-foreground text-xs bg-secondary px-1 py-0.5 rounded">
          ⇧⌘P
        </kbd>{" "}
        to open the Command Palette
      </p>
      <p className="text-sm text-muted-foreground">3. Type and run:</p>
      <CopyLine text="Shell Command: Install 'code' command in PATH" />
    </div>
  );
}

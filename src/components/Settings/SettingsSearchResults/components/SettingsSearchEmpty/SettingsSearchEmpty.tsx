/** Empty state shown when a settings search returns no matches. */
export function SettingsSearchEmpty(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <p className="text-sm font-medium text-foreground">No matching settings</p>
      <p className="mt-1 text-xs text-muted-foreground">Try a different search term.</p>
    </div>
  )
}

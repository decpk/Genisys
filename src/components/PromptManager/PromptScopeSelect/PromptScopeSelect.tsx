import { SCOPABLE_APPS, type PromptScopeApp } from '@/lib/prompt-scope'

export interface PromptScopeSelectProps {
  /** Currently selected scope app ids. Empty array = "all apps". */
  value: PromptScopeApp[]
  onChange: (next: PromptScopeApp[]) => void
}

/**
 * Multi-select chip group that restricts a single prompt to one or more app
 * surfaces. Selecting no chips equals "show in all apps". Mirrors
 * `FolderScopeSelector` but with prompt-level wording.
 */
export function PromptScopeSelect(props: PromptScopeSelectProps): React.JSX.Element {
  const { value, onChange } = props
  const selected = new Set<PromptScopeApp>(value)

  const toggle = (id: PromptScopeApp) => {
    const next = new Set(selected)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onChange(Array.from(next))
  }

  const isAllApps = selected.size === 0

  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
        Show this prompt in
      </label>
      <p className="text-[10.5px] text-muted-foreground/80 mb-2">
        {isAllApps
          ? 'Selecting nothing means this prompt shows up in every prompt picker.'
          : `Pinned to ${selected.size} app${selected.size === 1 ? '' : 's'}.`}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {SCOPABLE_APPS.map((app) => {
          const active = selected.has(app.id)
          const cls = active
            ? 'px-2 h-6 rounded-full border text-[11px] cursor-pointer transition-colors border-primary bg-primary/15 text-foreground'
            : 'px-2 h-6 rounded-full border text-[11px] cursor-pointer transition-colors border-border bg-background text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
          return (
            <button key={app.id} type="button" className={cls} onClick={() => toggle(app.id)}>
              {app.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

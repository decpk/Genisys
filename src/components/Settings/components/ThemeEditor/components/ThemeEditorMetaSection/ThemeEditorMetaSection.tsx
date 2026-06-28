import { Switch } from '@/components/ui/switch'

import { STYLES } from '../../ThemeEditor.styles'

export interface ThemeEditorMetaSectionProps {
  name: string
  isDark: boolean
  nameError: string | null
  onChangeName: (next: string) => void
  onToggleDark: (next: boolean) => void
}

export function ThemeEditorMetaSection(props: ThemeEditorMetaSectionProps): React.JSX.Element {
  const { name, isDark, nameError, onChangeName, onToggleDark } = props

  let nameErrorNode: React.ReactNode = null
  if (nameError !== null) {
    nameErrorNode = <span className={STYLES.validationError}>{nameError}</span>
  }

  return (
    <>
      <div className={STYLES.metaRow}>
        <label htmlFor="theme-editor-name" className={STYLES.metaLabel}>
          Theme name
        </label>
        <input
          id="theme-editor-name"
          type="text"
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          className={STYLES.metaInput}
          placeholder="My beautiful theme"
          maxLength={60}
        />
        {nameErrorNode}
      </div>

      <div className={STYLES.toggleRow}>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className={STYLES.metaLabel}>Dark mode</span>
          <span className="text-[11px] text-muted-foreground">
            Hints downstream behavior (e.g. system schedule). Affects category only.
          </span>
        </div>
        <Switch checked={isDark} onCheckedChange={onToggleDark} />
      </div>
    </>
  )
}

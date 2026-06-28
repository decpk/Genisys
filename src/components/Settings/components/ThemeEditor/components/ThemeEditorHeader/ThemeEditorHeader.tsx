import { STYLES } from '../../ThemeEditor.styles'

export interface ThemeEditorHeaderProps {
  title: string
}

export function ThemeEditorHeader(props: ThemeEditorHeaderProps): React.JSX.Element {
  const { title } = props
  return (
    <header className={STYLES.header}>
      <div className="flex flex-col gap-1 min-w-0">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Custom themes are saved as JSON files in your data directory and can be selected from the
          theme switcher just like built-in themes.
        </p>
      </div>
    </header>
  )
}

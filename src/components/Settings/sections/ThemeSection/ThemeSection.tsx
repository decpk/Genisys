import { ActiveThemeSetting } from '../../components/ActiveThemeSetting'
import { CustomThemeManagerSetting } from '../../components/CustomThemeManagerSetting'
import { ThemeEditor } from '../../components/ThemeEditor'
import { HideWhileSearching } from '../../components/HideWhileSearching'
import { useThemeSectionData } from './useThemeSectionData'

export function ThemeSection(): React.JSX.Element {
  const data = useThemeSectionData()

  let editorNode: React.ReactNode = null
  if (data.editorMode !== null && data.editorSeed !== null) {
    editorNode = (
      <div className="pt-2">
        <ThemeEditor
          key={data.editorKey}
          mode={data.editorMode}
          initialTheme={data.editorSeed}
          onSaved={data.handleEditorSaved}
          onCancel={data.handleEditorCancel}
        />
      </div>
    )
  }

  return (
    <>
      <ActiveThemeSetting />
      <HideWhileSearching>
        <CustomThemeManagerSetting
          customThemes={data.customThemes}
          activeThemeId={data.activeThemeId}
          onCreate={data.handleCreate}
          onEdit={data.handleEdit}
          onDuplicate={data.handleDuplicate}
          onDelete={data.handleDelete}
          onApply={data.handleApply}
        />
        {editorNode}
      </HideWhileSearching>
    </>
  )
}

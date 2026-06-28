import type { ThemeTokenGroup } from '@/themes/themeTokenCatalog.types'

import { ColorTokenGroupSection } from './components/ColorTokenGroupSection'
import { ThemeEditorFooter } from './components/ThemeEditorFooter'
import { ThemeEditorHeader } from './components/ThemeEditorHeader'
import { ThemeEditorMetaSection } from './components/ThemeEditorMetaSection'
import { ThemePreview } from './components/ThemePreview'
import { STYLES } from './ThemeEditor.styles'
import type { ThemeEditorProps } from './ThemeEditor.types'
import { useThemeEditorData } from './useThemeEditorData'
import { getThemeTokenGroupMeta } from './utils/getThemeTokenGroupMeta'

const GROUP_ORDER: ThemeTokenGroup[] = ['surface', 'text', 'interactive', 'feedback', 'sidebar']

export function ThemeEditor(props: ThemeEditorProps): React.JSX.Element {
  const { mode } = props
  const data = useThemeEditorData(props)

  const groupSections = GROUP_ORDER.map((group) => {
    const meta = getThemeTokenGroupMeta(group)
    return (
      <ColorTokenGroupSection
        key={group}
        group={group}
        groupLabel={meta.label}
        groupDescription={meta.description}
        draft={data.draft}
        onChangeColor={data.handleChangeColor}
        defaultExpanded={group !== 'sidebar'}
      />
    )
  })

  let title: string
  if (mode === 'create') {
    title = 'Create custom theme'
  } else {
    title = 'Edit custom theme'
  }

  let saveLabel: string
  if (data.isSaving) {
    saveLabel = 'Saving…'
  } else {
    saveLabel = 'Save theme'
  }

  return (
    <div className={STYLES.container}>
      <ThemeEditorHeader title={title} />

      <div className={STYLES.body}>
        <div className={STYLES.leftColumn}>
          <ThemeEditorMetaSection
            name={data.draft.name}
            isDark={data.draft.isDark}
            nameError={data.validation.nameError}
            onChangeName={data.handleChangeName}
            onToggleDark={data.handleToggleDark}
          />
          {groupSections}
        </div>

        <div className={STYLES.rightColumn}>
          <ThemePreview draft={data.draft} />
        </div>
      </div>

      <ThemeEditorFooter
        saveLabel={saveLabel}
        saveError={data.saveError}
        isSaving={data.isSaving}
        isValid={data.validation.isValid}
        onCancel={data.handleCancel}
        onSave={data.handleSave}
      />
    </div>
  )
}

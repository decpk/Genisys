import { EditorSection } from './components/EditorSection'
import { EDITOR_SECTIONS } from './MeetingEditorSections.types'
import { meetingEditorSectionsStyles as styles } from './MeetingEditorSections.styles'
import type { MeetingEditorSectionsProps } from './MeetingEditorSections.types'

export function MeetingEditorSections(
  props: MeetingEditorSectionsProps
): React.JSX.Element {
  const { formData, onFieldChange } = props

  const sections = EDITOR_SECTIONS.map((section) => {
    const hasContent = !!formData[section.key].trim()

    return (
      <EditorSection
        key={section.key}
        label={section.label}
        placeholder={section.placeholder}
        value={formData[section.key]}
        onChange={(md) => onFieldChange(section.key, md)}
        defaultExpanded={hasContent}
      />
    )
  })

  return <div className={styles.root}>{sections}</div>
}

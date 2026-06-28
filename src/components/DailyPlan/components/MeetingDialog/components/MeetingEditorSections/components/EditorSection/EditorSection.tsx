import { ChevronRight } from 'lucide-react'
import { WysiwygEditor } from '@/frameworks/wysiwyg-editor/WysiwygEditor'
import { getContentSummary } from '../../utils/getContentSummary'
import { useEditorSectionData } from './useEditorSectionData'
import { editorSectionStyles as styles } from './EditorSection.styles'
import type { EditorSectionProps } from './EditorSection.types'

export function EditorSection(props: EditorSectionProps): React.JSX.Element {
  const { label, placeholder, value, onChange } = props
  const { expanded, toggle } = useEditorSectionData(props)

  const summary = getContentSummary(value)
  const isEmpty = !value.trim()

  const chevronClass = expanded
    ? `${styles.chevron} ${styles.chevronExpanded}`
    : styles.chevron

  const badgeClass = isEmpty ? styles.badgeEmpty : styles.badge
  const badgeContent = isEmpty ? 'Empty' : summary

  const editorContent = expanded ? (
    <div className={styles.body}>
      <WysiwygEditor
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={styles.editor}
      />
    </div>
  ) : null

  return (
    <div className={styles.root}>
      <div
        className={styles.header}
        onClick={toggle}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') toggle()
        }}
      >
        <div className={styles.headerLeft}>
          <ChevronRight size={16} className={chevronClass} />
          <span className={styles.label}>{label}</span>
        </div>
        <span className={badgeClass}>{badgeContent}</span>
      </div>
      {editorContent}
    </div>
  )
}

import { useState } from 'react'
import { FileText, Copy, Check, Settings2 } from 'lucide-react'
import { IconButton } from '@/components/ui/icon-button'
import { WysiwygEditor } from '@/frameworks/wysiwyg-editor'
import { StatusTemplateModal } from '@/components/DailyPlan/components/StatusTemplateModal'

import { useDailyStatusPanelData } from './hooks/useDailyStatusPanelData'
import { styles } from './DailyStatusPanel.styles'

export function DailyStatusPanel(): React.JSX.Element {
  const { data, actions } = useDailyStatusPanelData()
  const { selectedDate, localContent, copied, dateLabel } = data
  const { handleChange, handleCopy } = actions
  const [templateModalOpen, setTemplateModalOpen] = useState(false)

  const copyIcon = copied
    ? <Check className={styles.copiedIcon} />
    : <Copy className={styles.copyIcon} />

  return (
    <div className={styles.container}>
      {/* Compact toolbar */}
      <div className={styles.header}>
        <div className={styles.headerIcon}>
          <FileText className={styles.headerIconSvg} />
        </div>
        <div className="flex flex-col flex-1">
          <h3 className={styles.headerTitle}>Daily Status</h3>
          <span className={styles.headerDate}>{dateLabel}</span>
        </div>
        <IconButton
          variant="default"
          size="sm"
          onClick={() => setTemplateModalOpen(true)}
          tooltip="Edit status template"
          className={styles.copyButton}
        >
          <Settings2 className={styles.copyIcon} />
        </IconButton>
        <IconButton
          variant="default"
          size="sm"
          onClick={handleCopy}
          tooltip="Copy to clipboard"
          className={styles.copyButton}
        >
          {copyIcon}
        </IconButton>
      </div>

      {/* Full-height editor */}
      <div className={styles.editorArea}>
        <div className={styles.editorWrapper}>
          <div className={styles.editor}>
            <WysiwygEditor
              key={selectedDate}
              value={localContent}
              onChange={handleChange}
              placeholder="Write your daily status update..."
              style={{ padding: '1px' }}
            />
          </div>
        </div>
      </div>

      <StatusTemplateModal open={templateModalOpen} onOpenChange={setTemplateModalOpen} />
    </div>
  )
}

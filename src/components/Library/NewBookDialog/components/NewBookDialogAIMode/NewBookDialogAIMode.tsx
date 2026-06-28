import { BookLengthPicker } from '../BookLengthPicker'
import { ContentTypePicker } from '../ContentTypePicker'
import { CrawlingOverlay } from '../CrawlingOverlay'
import { InlineModelPicker } from '../InlineModelPicker'
import { LanguagePicker } from '../LanguagePicker'
import { ModeToggle } from '../ModeToggle'
import { NewBookDialogFooter } from '../NewBookDialogFooter'
import { SourceTypePicker } from '../SourceTypePicker'
import { selectAISubtitle } from '../../utils/selectAISubtitle'
import { selectCreateLabel } from '../../utils/selectCreateLabel'

import {
  FIELDS_WRAPPER,
  FIELD_LABEL,
  HEADER_SUBTITLE,
  HEADER_TITLE,
  ROOT,
} from './NewBookDialogAIMode.styles'
import type { NewBookDialogAIModeProps } from './NewBookDialogAIMode.types'
import { NewBookDialogSourceFields } from './components/NewBookDialogSourceFields'

export function NewBookDialogAIMode(props: NewBookDialogAIModeProps): React.JSX.Element {
  const { data, onCancel } = props
  const subtitle = selectAISubtitle(data.contentType, data.sourceType)
  const createLabel = selectCreateLabel(data.mode, data.contentType, data.sourceType)

  return (
    <div className={ROOT}>
      <div>
        <h2 className={HEADER_TITLE}>Create New Book</h2>
        <p className={HEADER_SUBTITLE}>{subtitle}</p>
      </div>

      <ModeToggle mode={data.mode} onModeChange={data.setMode} />

      <ContentTypePicker value={data.contentType} onChange={data.setContentType} />

      <SourceTypePicker value={data.sourceType} onChange={data.setSourceType} />

      <div className={FIELDS_WRAPPER}>
        <NewBookDialogSourceFields data={data} />

        <BookLengthPicker
          value={data.bookLength}
          onChange={data.setBookLength}
          contentType={data.contentType}
          sourceType={data.sourceType}
        />

        <div>
          <label className={FIELD_LABEL}>Model</label>
          <InlineModelPicker selectedModelId={data.model} onModelChange={data.setModel} />
        </div>

        <div>
          <label className={FIELD_LABEL}>Language</label>
          <LanguagePicker value={data.language} onChange={data.setLanguage} />
        </div>
      </div>

      <NewBookDialogFooter
        createLabel={createLabel}
        isCreateDisabled={data.isCreateDisabled}
        onCreate={data.handleCreate}
        onCancel={onCancel}
      />

      {data.isCrawling && <CrawlingOverlay url={data.webpageUrl} />}
    </div>
  )
}

import { Input } from '@/components/ui/input'

import { LocalFilesPicker } from '../LocalFilesPicker'
import { ModeToggle } from '../ModeToggle'
import { NewBookDialogFooter } from '../NewBookDialogFooter'
import { selectCreateLabel } from '../../utils/selectCreateLabel'

import {
  FIELDS_WRAPPER,
  FIELD_LABEL,
  HEADER_SUBTITLE,
  HEADER_TITLE,
  ROOT,
} from './NewBookDialogLocalMode.styles'
import type { NewBookDialogLocalModeProps } from './NewBookDialogLocalMode.types'

export function NewBookDialogLocalMode(
  props: NewBookDialogLocalModeProps,
): React.JSX.Element {
  const { data, onCancel } = props
  const createLabel = selectCreateLabel(data.mode, data.contentType, data.sourceType)

  return (
    <div className={ROOT}>
      <div>
        <h2 className={HEADER_TITLE}>Import from Markdown Files</h2>
        <p className={HEADER_SUBTITLE}>
          Each file becomes a chapter — file order is preserved.
        </p>
      </div>

      <ModeToggle mode={data.mode} onModeChange={data.setMode} />

      <div className={FIELDS_WRAPPER}>
        <div>
          <label className={FIELD_LABEL}>
            Book Title <span className="normal-case opacity-60">(optional — derived from first file)</span>
          </label>
          <Input
            placeholder="e.g., My Notes Collection"
            value={data.title}
            onChange={(e) => data.setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className={FIELD_LABEL}>
            Description <span className="normal-case opacity-60">(optional)</span>
          </label>
          <Input
            placeholder="Brief description"
            value={data.description}
            onChange={(e) => data.setDescription(e.target.value)}
          />
        </div>

        <LocalFilesPicker
          files={data.selectedFiles}
          onBrowse={data.handleSelectFiles}
          onRemove={data.handleRemoveFile}
          onFilesDropped={data.handleFilesDropped}
          enabled={data.mode === 'local-md'}
        />
      </div>

      <NewBookDialogFooter
        createLabel={createLabel}
        isCreateDisabled={data.isCreateDisabled}
        onCreate={data.handleCreate}
        onCancel={onCancel}
      />
    </div>
  )
}

import { FileSourceField } from './components/FileSourceField'
import { HtmlSourceField } from './components/HtmlSourceField'
import { UrlSourceField } from './components/UrlSourceField'
import type { ImportSourceFieldsProps } from './ImportSourceFields.types'

export function ImportSourceFields(props: ImportSourceFieldsProps) {
  const {
    source,
    url,
    onUrlChange,
    html,
    onHtmlChange,
    filePath,
    isReadingFile,
    onPickFile,
    onClearFile,
    onSubmit,
  } = props

  if (source === 'url') {
    return <UrlSourceField value={url} onChange={onUrlChange} onSubmit={onSubmit} />
  }

  if (source === 'html') {
    return <HtmlSourceField value={html} onChange={onHtmlChange} />
  }

  return (
    <FileSourceField
      filePath={filePath}
      isReadingFile={isReadingFile}
      onPick={onPickFile}
      onClear={onClearFile}
    />
  )
}

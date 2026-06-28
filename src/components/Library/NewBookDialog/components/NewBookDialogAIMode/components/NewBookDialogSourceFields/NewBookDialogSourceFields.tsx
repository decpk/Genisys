import { Input } from '@/components/ui/input'

import { CrawledSourceChip } from '../../../CrawledSourceChip'
import { WebpageUrlInput } from '../../../WebpageUrlInput'
import { extractDomainFromUrl } from '../../../../utils/extractDomainFromUrl'
import { formatByteSize } from '../../../../utils/formatByteSize'
import { FIELD_LABEL } from '../../NewBookDialogAIMode.styles'

import type { NewBookDialogSourceFieldsProps } from './NewBookDialogSourceFields.types'

export function NewBookDialogSourceFields(
  props: NewBookDialogSourceFieldsProps,
): React.JSX.Element {
  const { data } = props
  const isWebpage = data.sourceType === 'webpage'

  if (isWebpage) {
    return (
      <WebpageSourceFields
        webpageUrl={data.webpageUrl}
        onWebpageUrlChange={data.setWebpageUrl}
        onSubmit={data.handleCreate}
        urlError={data.urlError}
        isCrawling={data.isCrawling}
        crawledSource={data.crawledSource}
      />
    )
  }

  return (
    <TopicSourceFields
      title={data.title}
      onTitleChange={data.setTitle}
      description={data.description}
      onDescriptionChange={data.setDescription}
      onKeyDown={data.handleKeyDown}
      contentType={data.contentType}
    />
  )
}

interface TopicSourceFieldsProps {
  title: string
  onTitleChange: (next: string) => void
  description: string
  onDescriptionChange: (next: string) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  contentType: 'book' | 'article'
}

function TopicSourceFields(props: TopicSourceFieldsProps): React.JSX.Element {
  const isArticle = props.contentType === 'article'
  const titleLabel = isArticle ? 'Article Title' : 'Book Title'
  const titlePlaceholder = isArticle
    ? 'e.g., Understanding WebSockets'
    : 'e.g., Mastering React Hooks'

  return (
    <>
      <div>
        <label className={FIELD_LABEL}>{titleLabel}</label>
        <Input
          placeholder={titlePlaceholder}
          value={props.title}
          onChange={(e) => props.onTitleChange(e.target.value)}
          onKeyDown={props.onKeyDown}
          autoFocus
        />
      </div>
      <div>
        <label className={FIELD_LABEL}>
          Description <span className="normal-case opacity-60">(optional)</span>
        </label>
        <Input
          placeholder="Brief description"
          value={props.description}
          onChange={(e) => props.onDescriptionChange(e.target.value)}
          onKeyDown={props.onKeyDown}
        />
      </div>
    </>
  )
}

interface WebpageSourceFieldsProps {
  webpageUrl: string
  onWebpageUrlChange: (next: string) => void
  onSubmit: () => void
  urlError: string
  isCrawling: boolean
  crawledSource: { url: string; content: string } | null
}

function WebpageSourceFields(props: WebpageSourceFieldsProps): React.JSX.Element {
  const showChip = props.crawledSource !== null
  let chipDomain = ''
  let chipByteSize = ''
  if (props.crawledSource) {
    chipDomain = extractDomainFromUrl(props.crawledSource.url)
    chipByteSize = formatByteSize(
      new Blob([props.crawledSource.content]).size,
    )
  }

  return (
    <>
      <WebpageUrlInput
        value={props.webpageUrl}
        onChange={props.onWebpageUrlChange}
        onSubmit={props.onSubmit}
        error={props.urlError}
        isLoading={props.isCrawling}
        autoFocus
      />
      {showChip && <CrawledSourceChip domain={chipDomain} byteSize={chipByteSize} />}
    </>
  )
}

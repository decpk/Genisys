import { useEffect, useRef } from 'react'

import { isWebpageLength, type BookLength } from '../../book-prompt'
import {
  DEFAULT_ARTICLE_LENGTH,
  DEFAULT_BOOK_LENGTH,
  DEFAULT_WEBPAGE_LENGTH,
} from '../NewBookDialog.constants'

import { useLocalFilesData } from './useLocalFilesData'
import { useLocalFilesDropToast } from './useLocalFilesDropToast'
import type { ActionsApi } from './useNewBookDialogActions'
import { useNewBookDialogActions } from './useNewBookDialogActions'
import type { NewBookDialogStateApi } from './useNewBookDialogState'
import { useNewBookDialogState } from './useNewBookDialogState'
import { useSplitResize } from './useSplitResize'
import type { LocalFilesDataApi } from './useLocalFilesData'
import { useWebpageCrawl } from './useWebpageCrawl'

export interface NewBookDialogData
  extends NewBookDialogStateApi,
    LocalFilesDataApi,
    ActionsApi {
  splitContainerRef: React.RefObject<HTMLDivElement | null>
  leftFraction: number
  handleSplitMouseDown: (e: React.MouseEvent) => void
  handleFilesDropped: (paths: string[]) => void
}

export function useNewBookDialogData(
  onOpenChange: (open: boolean) => void,
): NewBookDialogData {
  const state = useNewBookDialogState()
  const splitContainerRef = useRef<HTMLDivElement>(null)
  const split = useSplitResize(splitContainerRef)
  const webpageCrawl = useWebpageCrawl()
  const localFiles = useLocalFilesData(state.selectedFiles, state.setSelectedFiles)
  const dropToast = useLocalFilesDropToast({
    handleAppendDroppedFiles: localFiles.handleAppendDroppedFiles,
  })
  const actions = useNewBookDialogActions({
    mode: state.mode,
    contentType: state.contentType,
    sourceType: state.sourceType,
    title: state.title,
    description: state.description,
    bookLength: state.bookLength,
    model: state.model,
    rawMarkdown: state.rawMarkdown,
    selectedFiles: state.selectedFiles,
    webpageUrl: state.webpageUrl,
    isCrawling: state.isCrawling,
    language: state.language,
    setTitle: state.setTitle,
    setRawMarkdown: state.setRawMarkdown,
    setIsCrawling: state.setIsCrawling,
    setUrlError: state.setUrlError,
    setCrawledSource: state.setCrawledSource,
    resetForm: state.resetForm,
    crawl: webpageCrawl.crawl,
    onOpenChange,
  })

  // Sync bookLength to a sensible default whenever sourceType flips between
  // 'topic' and 'webpage'. Only depend on sourceType to avoid feedback loops
  // when the user manually picks a different bookLength.
  const contentTypeRef = useRef(state.contentType)
  contentTypeRef.current = state.contentType
  const bookLengthRef = useRef(state.bookLength)
  bookLengthRef.current = state.bookLength

  useEffect(() => {
    const currentBookLength = bookLengthRef.current
    const currentContentType = contentTypeRef.current

    if (state.sourceType === 'webpage' && !isWebpageLength(currentBookLength)) {
      state.setBookLength(DEFAULT_WEBPAGE_LENGTH as BookLength)
    } else if (state.sourceType === 'topic' && isWebpageLength(currentBookLength)) {
      state.setBookLength(
        currentContentType === 'article' ? DEFAULT_ARTICLE_LENGTH : DEFAULT_BOOK_LENGTH,
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.sourceType])

  return {
    splitContainerRef,
    leftFraction: split.leftFraction,
    handleSplitMouseDown: split.handleMouseDown,
    handleFilesDropped: dropToast.handleFilesDropped,
    ...state,
    ...localFiles,
    ...actions,
  }
}

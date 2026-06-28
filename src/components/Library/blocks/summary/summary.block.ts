import { defineBlock } from '@/frameworks/block-kit'

import { SummaryBlock } from './SummaryBlock'

/** `<lib-summary>` — the end-of-chapter recap card (also parsed for continuity). */
export const summaryBlock = defineBlock({
  tag: 'lib-summary',
  attributes: [],
  childrenContent: 'markdown',
  Renderer: SummaryBlock,
})

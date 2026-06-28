import { defineBlock } from '@/frameworks/block-kit'

import { CalloutBlock } from './CalloutBlock'

/**
 * `<lib-callout variant="did-you-know|try-this|war-story|analogy|hint|…">`
 * Engagement callout cards. `variant` is an open vocabulary with a safe default.
 */
export const calloutBlock = defineBlock({
  tag: 'lib-callout',
  attributes: ['variant'],
  childrenContent: 'markdown',
  Renderer: CalloutBlock,
})

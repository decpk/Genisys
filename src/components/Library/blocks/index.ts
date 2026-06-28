import { createBlockRegistry, type SanitizeExtend } from '@/frameworks/block-kit'

import { calloutBlock } from './callout'
import { summaryBlock } from './summary'

/**
 * Library block pack. Each block is a self-contained definition under its own
 * folder; this barrel assembles them into the registry that the Library's
 * `<BlockMarkdown>` mounts consume.
 *
 * Add a block: drop a folder with a `*.block.ts`, import it here, and append it
 * to `libraryBlocks`. Nothing else needs to change.
 */
export const libraryBlocks = [calloutBlock, summaryBlock]

export const libraryBlockRegistry = createBlockRegistry(libraryBlocks)

/**
 * Library-specific sanitization additions layered on top of the registry-derived
 * schema: image source-attribution data attributes and the offline
 * `library-image:` scheme used by cached chapter images.
 */
export const librarySanitizeExtend: SanitizeExtend = {
  attributes: {
    img: ['dataSourceUrl', 'dataSourceDomain', 'dataSourceLabel'],
  },
  protocols: {
    src: ['library-image'],
  },
}

/** Custom URL schemes the Library renderer must let through untouched. */
export const libraryUrlSchemes = ['library-image'] as const

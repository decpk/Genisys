//! Attach parsed image-source metadata to an mdast image node so it
//! survives the mdast → hast conversion as `data-*` HTML attributes
//! readable from React component overrides.

import type { ParsedImageSource } from './parseImageSourceText'

interface MdastImage {
  type: string
  data?: {
    hProperties?: Record<string, string>
  }
}

/**
 * Mutate `image.data.hProperties` so the resulting `<img>` element gains
 * `data-source-url`, `data-source-domain`, and `data-source-label`
 * attributes. These are consumed by the `BookImage` React component.
 */
export function attachSourceToImage(image: MdastImage, source: ParsedImageSource): void {
  if (!source.url && !source.domain && !source.label) return
  image.data = image.data ?? {}
  image.data.hProperties = image.data.hProperties ?? {}
  if (source.url) image.data.hProperties['data-source-url'] = source.url
  if (source.domain) image.data.hProperties['data-source-domain'] = source.domain
  if (source.label) image.data.hProperties['data-source-label'] = source.label
}

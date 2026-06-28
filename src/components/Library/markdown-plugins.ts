import { defaultUrlTransform } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

import { remarkImageSource } from './markdown-plugins/remarkImageSource'

/**
 * Shared remark/rehype plugin sets used by every ReactMarkdown call site in
 * the Library app. Centralising these here ensures the chapter viewer, the
 * preview pane, quizzes, and challenges all render math (and GFM) the same
 * way.
 *
 * - `remark-gfm`         → tables, task lists, autolinks
 * - `remark-math`        → recognise $…$ and $$…$$ math syntax
 * - `remark-image-source`→ pulls italic `*Source: ...*` lines into the
 *                          following image as data attributes (and removes
 *                          the standalone paragraph from the output)
 * - `rehype-katex`       → render the math via KaTeX (CSS imported in main.css)
 */
export const libraryRemarkPlugins = [remarkGfm, remarkMath, remarkImageSource]
export const libraryRehypePlugins = [rehypeKatex]

/**
 * URL transform used by every Library `ReactMarkdown` mount point.
 *
 * `react-markdown` ships with `defaultUrlTransform` which sanitises URLs by
 * allow-listing safe protocols (`http`, `https`, `irc`, `ircs`, `mailto`,
 * `xmpp`) and stripping everything else (including `javascript:` — that
 * safety must be preserved).
 *
 * The Library caches downloaded images on disk and rewrites their markdown
 * references to the custom `library-image://<bookId>/<filename>` scheme,
 * which is served by a Tauri URI scheme handler. Without this transform,
 * `defaultUrlTransform` would blank those URLs out and the chapter would
 * render no images at all — even though the underlying scheme works fine
 * (see `src-tauri/src/commands/library/library_image_scheme.rs` and the
 * `img-src library-image:` entry in the CSP).
 *
 * We let `library-image://` URLs pass through untouched and delegate every
 * other URL (links, external images, etc.) to `defaultUrlTransform` so the
 * existing XSS protections stay in place.
 */
export function libraryUrlTransform(url: string): string {
  if (typeof url === 'string' && /^library-image:\/\//i.test(url)) {
    return url
  }
  return defaultUrlTransform(url)
}

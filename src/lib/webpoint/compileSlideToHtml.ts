import type { SlideData } from '@/store/webpoint-store/types'

import { renderSlideElementHtml } from './renderSlideElementHtml'
import { SLIDE_KEYFRAMES_CSS } from './slideAnimationCss'
import { slideBackgroundToCss } from './slideBackgroundToCss'

/** Defensively prevent an author/AI `customJs` payload from closing the
 *  injecting `<script>` tag early. The frame is sandboxed regardless. */
function sanitizeScript(js: string): string {
  return js.replace(/<\/script/gi, '<\\/script')
}

/**
 * Compile a structured slide into a self-contained HTML document for the
 * sandboxed `webpoint://` renderer. All CSS/JS is inlined; no external
 * resources are referenced.
 */
export function compileSlideToHtml(data: SlideData): string {
  const background = slideBackgroundToCss(data.background)
  const elements = data.elements.map((el) => renderSlideElementHtml(el, 'vw')).join('\n')
  const customCss = data.customCss ?? ''
  const customJs = data.customJs ? `<script>${sanitizeScript(data.customJs)}</script>` : ''

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src data: blob:; media-src data: blob:; font-src data:; style-src 'unsafe-inline'; script-src 'unsafe-inline';" />
<style>
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;overflow:hidden}
body{position:relative;background:${background};font-family:Inter,system-ui,sans-serif;color:#fff}
img{max-width:100%}
${SLIDE_KEYFRAMES_CSS}
${customCss}
</style>
</head>
<body>
${elements}
${customJs}
</body>
</html>`
}

import { escapeHtml } from '@/lib/webpoint/escapeHtml'
import { renderSlideElementHtml } from '@/lib/webpoint/renderSlideElementHtml'
import { SLIDE_KEYFRAMES_CSS } from '@/lib/webpoint/slideAnimationCss'
import { slideBackgroundToCss } from '@/lib/webpoint/slideBackgroundToCss'
import type { PresentationWithSlides, Slide } from '@/store/webpoint-store/types'

const DECK_CSS = `
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:100%;height:100%;background:#000;overflow:hidden;font-family:Inter,system-ui,sans-serif}
#wp-deck{position:relative;width:100vw;height:100vh}
.wp-stage{position:absolute;left:50%;top:50%;width:1280px;height:720px;transform:translate(-50%,-50%) scale(var(--wp-scale,1));transform-origin:center}
.wp-slide{position:absolute;inset:0;width:1280px;height:720px;overflow:hidden;display:none;color:#fff}
.wp-slide.active{display:block}
.wp-nav{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);display:flex;gap:14px;align-items:center;background:rgba(0,0,0,.6);color:#fff;padding:8px 16px;border-radius:999px;font-size:13px;user-select:none}
.wp-nav button{background:none;border:0;color:#fff;cursor:pointer;font-size:18px;line-height:1}
@media print{
  html,body{overflow:visible;background:#fff}
  .wp-stage{position:static;transform:none}
  .wp-slide{position:relative;display:block!important;page-break-after:always}
  .wp-nav{display:none}
}
${SLIDE_KEYFRAMES_CSS}`

const DECK_RUNTIME = `(function(){
  var slides=[].slice.call(document.querySelectorAll('.wp-slide'));
  var idx=0;var count=document.getElementById('wp-count');
  function fit(){var s=Math.min(window.innerWidth/1280,window.innerHeight/720);document.documentElement.style.setProperty('--wp-scale',s);}
  function show(i){idx=Math.max(0,Math.min(i,slides.length-1));slides.forEach(function(el,j){el.classList.toggle('active',j===idx);});if(count)count.textContent=(idx+1)+' / '+slides.length;}
  function next(){show(idx+1);}function prev(){show(idx-1);}
  document.addEventListener('keydown',function(e){if(e.key==='ArrowRight'||e.key===' '||e.key==='PageDown'){e.preventDefault();next();}else if(e.key==='ArrowLeft'||e.key==='PageUp'){prev();}});
  var n=document.getElementById('wp-next');if(n)n.onclick=next;var p=document.getElementById('wp-prev');if(p)p.onclick=prev;
  window.addEventListener('resize',fit);fit();show(0);
})();`

function renderSection(slide: Slide, index: number): string {
  const background = slideBackgroundToCss(slide.data.background)
  const elements = slide.data.elements.map((el) => renderSlideElementHtml(el, 'px')).join('')
  const customCss = slide.data.customCss ? `<style>${slide.data.customCss}</style>` : ''
  return `<section class="wp-slide" data-index="${index}" style="background:${background}">${elements}${customCss}</section>`
}

/**
 * Build a self-contained, single-file HTML presentation: every slide on a fixed
 * 1280×720 stage that scales to fit the viewport, with arrow-key navigation and
 * a print stylesheet (each slide becomes a landscape page for "Save as PDF").
 */
export function exportPresentationHtml(presentation: PresentationWithSlides): string {
  const sections = presentation.slides.map((slide, i) => renderSection(slide, i)).join('')
  const title = escapeHtml(presentation.presentation.title || 'Presentation')

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<style>${DECK_CSS}</style>
</head>
<body>
<div id="wp-deck"><div class="wp-stage">${sections}</div></div>
<div class="wp-nav"><button id="wp-prev" aria-label="Previous">&lsaquo;</button><span id="wp-count"></span><button id="wp-next" aria-label="Next">&rsaquo;</button></div>
<script>${DECK_RUNTIME}</script>
</body>
</html>`
}

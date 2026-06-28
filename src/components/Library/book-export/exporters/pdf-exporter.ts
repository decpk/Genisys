import type { ExportFormat, ExportOptions } from '../types'
import { inlineCachedImagesInMarkdown } from '../../utils/inlineCachedImagesInMarkdown'
import { splitContentIntoSegments } from '../../quiz-parser'

// ─── Styles applied to the hidden render container ──────────────

const BOOK_STYLES = /* css */ `
  .book-export-root {
    font-family: Georgia, 'Times New Roman', serif;
    font-size: 14px;
    line-height: 1.75;
    color: #222;
    background: #fff;
    padding: 0 20px;
  }

  /* ── Cover page ── */
  .book-export-cover {
    text-align: center;
    padding-top: 260px;
  }
  .book-export-cover h1 {
    font-size: 32px;
    color: #111;
    margin-bottom: 14px;
  }
  .book-export-cover p {
    font-size: 16px;
    color: #555;
  }

  /* ── Chapter wrapper ── */
  .book-export-chapter h1 {
    font-size: 24px;
    color: #111;
    margin-bottom: 8px;
    padding-bottom: 10px;
    border-bottom: 2px solid #ddd;
  }

  /* ── Headings ── */
  h2 { font-size: 20px; margin-top: 24px; margin-bottom: 12px; color: #222; }
  h3 { font-size: 17px; margin-top: 20px; margin-bottom: 10px; color: #333; }
  h4, h5, h6 { font-size: 14px; margin-top: 14px; margin-bottom: 8px; color: #444; }

  /* ── Text ── */
  p { margin-bottom: 12px; }
  strong { font-weight: 700; }
  em { font-style: italic; }

  /* ── Code ── */
  pre {
    background: #f5f5f5;
    padding: 12px 14px;
    border-radius: 4px;
    overflow: hidden;
    font-size: 12px;
    line-height: 1.5;
    margin: 14px 0;
    white-space: pre-wrap;
    word-break: break-word;
  }
  code { font-family: 'Courier New', Courier, monospace; font-size: 12px; }
  :not(pre) > code { background: #efefef; padding: 2px 5px; border-radius: 3px; }

  /* ── Tables ── */
  table { border-collapse: collapse; width: 100%; margin: 14px 0; font-size: 13px; }
  th, td { border: 1px solid #ddd; padding: 7px 10px; text-align: left; }
  th { background: #f5f5f5; font-weight: 600; }

  /* ── Blockquotes ── */
  blockquote {
    border-left: 3px solid #bbb;
    padding-left: 14px;
    margin: 14px 0;
    color: #444;
    font-style: italic;
  }

  /* ── Lists ── */
  ul, ol { padding-left: 24px; margin-bottom: 12px; }
  li { margin-bottom: 4px; }

  /* ── Misc ── */
  img { max-width: 100%; height: auto; }
  hr { border: none; border-top: 1px solid #ddd; margin: 20px 0; }
  a { color: #2563eb; text-decoration: none; }
`

// ─── Helpers ────────────────────────────────────────────────────

function escapeHtml(text: string): string {
  const el = document.createElement('span')
  el.textContent = text
  return el.innerHTML
}

function buildCoverHtml(title: string, description?: string): string {
  return `
    <div class="book-export-cover">
      <h1>${escapeHtml(title)}</h1>
      ${description ? `<p>${escapeHtml(description)}</p>` : ''}
    </div>
  `
}

function buildChapterHtml(
  chapterNumber: number,
  title: string,
  contentHtml: string,
): string {
  return `
    <div class="book-export-chapter">
      <h1>Chapter ${chapterNumber}: ${escapeHtml(title)}</h1>
      ${contentHtml}
    </div>
  `
}

// ─── Block-aware page slicing ───────────────────────────────────
// Walk block-level children and collect their top & bottom edges.
// When slicing the canvas into pages, cut at the nearest block
// boundary that fits within the page height — never mid-paragraph.

const BLOCK_TAGS = new Set([
  'P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  'PRE', 'UL', 'OL', 'LI', 'TABLE', 'BLOCKQUOTE', 'HR', 'DIV',
])

function getBlockBreakPoints(rootEl: HTMLElement): number[] {
  const rootTop = rootEl.getBoundingClientRect().top
  const points = new Set<number>()

  // Walk all elements but collect bottom edges
  const walk = (el: Element) => {
    if (BLOCK_TAGS.has(el.tagName)) {
      const rect = el.getBoundingClientRect()
      points.add(rect.top - rootTop)
      points.add(rect.bottom - rootTop)
    }
    // Recurse into children for nested structures (lists, divs)
    for (const child of el.children) {
      walk(child)
    }
  }

  for (const child of rootEl.children) walk(child)

  return Array.from(points).sort((a, b) => a - b)
}

// ─── PDF Generator ──────────────────────────────────────────────
// Renders HTML via html2canvas section-by-section (cover + each
// chapter independently) to avoid hitting browser canvas size
// limits that cause blank pages with large books.

async function renderSectionToPdf(
  sectionHtml: string,
  pdf: InstanceType<typeof import('jspdf').jsPDF>,
  containerWidth: number,
  canvasScale: number,
  margin: number,
  needsFirstPage: boolean,
  html2canvas: typeof import('html2canvas').default,
): Promise<void> {
  const container = document.createElement('div')
  container.innerHTML = `<style>${BOOK_STYLES}</style><div class="book-export-root">${sectionHtml}</div>`
  Object.assign(container.style, {
    position: 'absolute',
    left: '-9999px',
    top: '0',
    width: `${containerWidth}px`,
    background: '#fff',
  })
  document.body.appendChild(container)

  try {
    const rootEl = container.querySelector('.book-export-root') as HTMLElement
    const breakPoints = getBlockBreakPoints(rootEl)

    const canvas = await html2canvas(rootEl, {
      scale: canvasScale,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })

    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    const usableW = pageW - margin * 2
    const usableH = pageH - margin * 2
    const pxToMm = usableW / containerWidth
    const pageHeightPx = usableH / pxToMm

    const totalHeightPx = canvas.height / canvasScale
    if (totalHeightPx <= 0) return

    const cutPoints: number[] = [0]
    let cursor = 0
    while (cursor < totalHeightPx) {
      const idealCut = cursor + pageHeightPx
      if (idealCut >= totalHeightPx) {
        cutPoints.push(totalHeightPx)
        break
      }
      let bestCut = -1
      for (let i = breakPoints.length - 1; i >= 0; i--) {
        if (breakPoints[i] <= idealCut && breakPoints[i] > cursor + 1) {
          bestCut = breakPoints[i]
          break
        }
      }
      if (bestCut < 0 || idealCut - bestCut > pageHeightPx * 0.35) {
        bestCut = idealCut
      }
      cutPoints.push(bestCut)
      cursor = bestCut
    }

    for (let i = 0; i < cutPoints.length - 1; i++) {
      if (!needsFirstPage || i > 0) pdf.addPage()
      needsFirstPage = false

      const yStart = Math.round(cutPoints[i] * canvasScale)
      const yEnd = Math.round(cutPoints[i + 1] * canvasScale)
      const sliceH = yEnd - yStart
      if (sliceH <= 0) continue

      const slice = document.createElement('canvas')
      slice.width = canvas.width
      slice.height = sliceH
      const ctx = slice.getContext('2d')!
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, slice.width, sliceH)
      ctx.drawImage(canvas, 0, yStart, canvas.width, sliceH, 0, 0, canvas.width, sliceH)

      const imgData = slice.toDataURL('image/jpeg', 0.95)
      const renderedH = (cutPoints[i + 1] - cutPoints[i]) * pxToMm
      pdf.addImage(imgData, 'JPEG', margin, margin, usableW, renderedH)
    }
  } finally {
    document.body.removeChild(container)
  }
}

const PDF_CALLOUT_LABELS: Record<string, string> = {
  'did-you-know': 'Did You Know?',
  'try-this': 'Try This Now',
  'war-story': 'War Story',
  'analogy': 'Analogy',
  'hint': 'Hint',
}

/**
 * Convert the lib-* block protocol into plain Markdown the PDF renderer (marked)
 * can lay out: callouts/summaries become labelled blockquotes, quizzes and
 * challenges are flattened into readable Q&A / task sections.
 */
function flattenLibBlocksForPdf(markdown: string): string {
  return splitContentIntoSegments(markdown)
    .map((seg) => {
      if (seg.type === 'quiz') {
        const lines = [`## ${seg.title}`]
        seg.questions.forEach((q, idx) => {
          lines.push(`\n**Q${idx + 1}. ${q.questionMarkdown}**\n`)
          q.options.forEach((o) => lines.push(`- ${o.isCorrect ? '☑' : '☐'} ${o.label}`))
          if (q.answer) lines.push(`\n> **Answer:** ${q.answer}`)
          if (q.explanation) lines.push(`> **Explanation:** ${q.explanation}`)
        })
        return lines.join('\n')
      }
      if (seg.type === 'challenge') {
        const lines = ['## Challenge']
        seg.challenges.forEach((c) => {
          lines.push(`\n### ${c.tier.toUpperCase()}: ${c.title}\n`)
          if (c.bodyMarkdown) lines.push(c.bodyMarkdown)
          if (c.solutionMarkdown) lines.push(`\n**Solution:**\n\n${c.solutionMarkdown}`)
        })
        return lines.join('\n')
      }
      return seg.content
        .replace(
          /<lib-callout\b[^>]*>([\s\S]*?)<\/lib-callout>/gi,
          (match, body: string) => {
            const variant = /variant="([^"]*)"/i.exec(match)?.[1] ?? ''
            const label = PDF_CALLOUT_LABELS[variant] ?? 'Note'
            const quoted = body.trim().split('\n').map((l) => `> ${l}`).join('\n')
            return `\n> **${label}**\n>\n${quoted}\n`
          },
        )
        .replace(
          /<lib-summary\b[^>]*>([\s\S]*?)<\/lib-summary>/gi,
          (_m, body: string) => `\n## Chapter Summary\n\n${body.trim()}\n`,
        )
        .replace(/<\/?lib-[a-z-]+\b[^>]*>/gi, '')
    })
    .join('\n\n')
}

async function generatePdfBlob(options: ExportOptions): Promise<Blob> {
  const [{ default: jsPDF }, { default: html2canvas }, { marked }] =
    await Promise.all([
      import('jspdf'),
      import('html2canvas'),
      import('marked'),
    ])

  const pdf = new jsPDF('p', 'mm', 'a4')
  const containerWidth = 700
  const canvasScale = 2
  const margin = 14

  // Render cover page
  const coverHtml = buildCoverHtml(options.bookTitle, options.bookDescription)
  await renderSectionToPdf(
    coverHtml, pdf, containerWidth, canvasScale, margin, true, html2canvas,
  )

  // Render each chapter independently to avoid canvas size limits
  for (const ch of options.chapters) {
    // Inline cached images as base64 so PDF rendering doesn't need network.
    const inlinedMarkdown = await inlineCachedImagesInMarkdown(ch.content)
    const html = marked.parse(flattenLibBlocksForPdf(inlinedMarkdown), { async: false }) as string
    const chapterHtml = buildChapterHtml(ch.chapterNumber, ch.title, html)
    await renderSectionToPdf(
      chapterHtml, pdf, containerWidth, canvasScale, margin, false, html2canvas,
    )
  }

  return pdf.output('blob')
}

// ─── Exported format descriptor ────────────────────────────────

export const pdfExporter: ExportFormat = {
  id: 'pdf',
  label: 'PDF Document',
  description: 'Export the complete book as a PDF file',
  extension: 'pdf',
  mimeType: 'application/pdf',
  export: generatePdfBlob,
}

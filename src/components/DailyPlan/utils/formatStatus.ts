import type { DPStatusFormat } from '../DailyPlan.types'

export function formatDailyStatus(
  statusContent: string,
  yesterdayReview: string,
  format: DPStatusFormat,
): string {
  const combined = yesterdayReview
    ? `## Yesterday's Review\n${yesterdayReview}\n\n${statusContent}`
    : statusContent

  switch (format) {
    case 'markdown':
      return combined
    case 'plain':
      return toPlainText(combined)
    case 'html':
      return toHtml(combined)
  }
}

function toPlainText(md: string): string {
  return md
    .split('\n')
    .map((line) => {
      const trimmed = line.trim()
      if (trimmed.startsWith('## ')) {
        return trimmed.slice(3).toUpperCase()
      }
      if (trimmed.startsWith('- ')) {
        return '  • ' + stripInlineFormatting(trimmed.slice(2))
      }
      return stripInlineFormatting(trimmed)
    })
    .join('\n')
}

function toHtml(md: string): string {
  const lines = md.split('\n')
  const result: string[] = []
  let inList = false

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.startsWith('## ')) {
      if (inList) {
        result.push('</ul>')
        inList = false
      }
      result.push(`<h3>${escapeHtml(trimmed.slice(3))}</h3>`)
    } else if (trimmed.startsWith('- ')) {
      if (!inList) {
        result.push('<ul>')
        inList = true
      }
      result.push(`<li>${convertInlineFormatting(escapeHtml(trimmed.slice(2)))}</li>`)
    } else if (trimmed === '') {
      if (inList) {
        result.push('</ul>')
        inList = false
      }
    } else {
      if (inList) {
        result.push('</ul>')
        inList = false
      }
      result.push(`<p>${convertInlineFormatting(escapeHtml(trimmed))}</p>`)
    }
  }

  if (inList) {
    result.push('</ul>')
  }

  return result.join('\n')
}

function stripInlineFormatting(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1')
}

function convertInlineFormatting(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

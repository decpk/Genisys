import { formatEntityToken } from '@/ai/entity-links'
import type { ToolModule, ToolResult } from '@/ai/tools/tools.types'

const tool: ToolModule = {
  name: 'clipboard_get_timeline',
  definition: {
    type: 'function',
    function: {
      name: 'clipboard_get_timeline',
      description:
        'Get a timeline of clipboard activity over the last N days, grouped by day and hour. Each item preview is wrapped as an entity-link token of the form [[entity:clipboard:<id>|<preview>]]. CRITICAL: when narrating the timeline, copy each token verbatim into your prose / table and never replace it with raw text or the bare ID — the tokens render as clickable chips that open the item. Present the result as a narrative story of the user\'s clipboard activity.',
      parameters: {
        type: 'object',
        properties: {
          days: {
            type: 'number',
            description: 'Number of days to look back. Defaults to 7.',
          },
        },
      },
    },
  },
  execute: async (args): Promise<ToolResult> => {
    const days = Math.min(Math.max((args.days as number) || 7, 1), 90)

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    const cutoffISO = cutoffDate.toISOString()

    try {
      const result = await window.api.loadClipboardItems({ limit: 500 })
      const allItems = result.items as Array<{
        id: string
        contentType: 'text' | 'image'
        textContent: string | null
        isPinned: boolean
        createdAt: string
        byteSize: number
        labels: Array<{ id: string; name: string; color: string }>
        imageDescription: string | null
      }>

      const items = allItems.filter((item) => item.createdAt >= cutoffISO)

      if (items.length === 0) {
        return {
          kind: 'success',
          message: `No clipboard activity found in the last ${days} day${days === 1 ? '' : 's'}.`,
        }
      }

      // Group items by day
      const dayMap = new Map<string, typeof items>()
      for (const item of items) {
        const date = item.createdAt.slice(0, 10)
        const existing = dayMap.get(date)
        if (existing) {
          existing.push(item)
        } else {
          dayMap.set(date, [item])
        }
      }

      const sortedDays = [...dayMap.entries()].sort((a, b) => b[0].localeCompare(a[0]))

      const parts: string[] = []
      parts.push(`**Clipboard Timeline — Last ${days} day${days === 1 ? '' : 's'}** (${items.length} items across ${sortedDays.length} day${sortedDays.length === 1 ? '' : 's'})`)
      parts.push('')

      // Overall summary
      const textCount = items.filter((i) => i.contentType === 'text').length
      const imageCount = items.filter((i) => i.contentType === 'image').length
      const pinnedCount = items.filter((i) => i.isPinned).length
      const labeledCount = items.filter((i) => i.labels.length > 0).length
      const totalBytes = items.reduce((sum, i) => sum + i.byteSize, 0)
      const allLabels = [...new Set(items.flatMap((i) => i.labels.map((l) => l.name)))]

      parts.push('### Overview')
      parts.push(`- **${textCount}** text clips, **${imageCount}** images`)
      if (pinnedCount > 0) parts.push(`- **${pinnedCount}** pinned items`)
      if (labeledCount > 0) parts.push(`- **${labeledCount}** labeled items`)
      parts.push(`- **${formatBytes(totalBytes)}** total data`)
      if (allLabels.length > 0) parts.push(`- Labels used: ${allLabels.join(', ')}`)
      parts.push('')

      // Per-day breakdown
      for (const [date, dayItems] of sortedDays) {
        const dayLabel = formatDayLabel(date)
        const dayText = dayItems.filter((i) => i.contentType === 'text').length
        const dayImage = dayItems.filter((i) => i.contentType === 'image').length

        parts.push(`### ${dayLabel} (${dayItems.length} item${dayItems.length === 1 ? '' : 's'}: ${dayText} text, ${dayImage} image)`)
        parts.push('')

        // Group by hour
        const hourMap = new Map<number, typeof dayItems>()
        for (const item of dayItems) {
          const hour = new Date(item.createdAt).getHours()
          const existing = hourMap.get(hour)
          if (existing) {
            existing.push(item)
          } else {
            hourMap.set(hour, [item])
          }
        }

        const sortedHours = [...hourMap.entries()].sort((a, b) => a[0] - b[0])

        for (const [hour, hourItems] of sortedHours) {
          const timeLabel = `${hour.toString().padStart(2, '0')}:00`
          const previews = hourItems.map((item) => {
            const type = item.contentType === 'text' ? '📝' : '🖼️'
            const pin = item.isPinned ? ' 📌' : ''
            const labels = item.labels.length > 0 ? ` [${item.labels.map((l) => l.name).join(', ')}]` : ''
            const preview =
              item.contentType === 'text'
                ? (item.textContent?.slice(0, 100)?.replace(/\n/g, ' ') ?? '(empty)')
                : (item.imageDescription ?? '(image, no description)')
            const previewCell = formatEntityToken('clipboard', item.id, preview)
            return `  - ${type}${pin} ${previewCell}${labels}`
          })

          parts.push(`**${timeLabel}** — ${hourItems.length} clip${hourItems.length === 1 ? '' : 's'}`)
          parts.push(previews.join('\n'))
        }

        parts.push('')
      }

      // Activity pattern insights
      const busiestDay = sortedDays.reduce((max, curr) => (curr[1].length > max[1].length ? curr : max))
      const busiestHours = items.reduce(
        (acc, item) => {
          const h = new Date(item.createdAt).getHours()
          acc[h] = (acc[h] || 0) + 1
          return acc
        },
        {} as Record<number, number>,
      )
      const peakHour = Object.entries(busiestHours).reduce((max, curr) =>
        (curr[1] as number) > (max[1] as number) ? curr : max,
      )

      parts.push('### Activity Insights')
      parts.push(`- **Busiest day:** ${formatDayLabel(busiestDay[0])} (${busiestDay[1].length} clips)`)
      parts.push(`- **Peak hour:** ${peakHour[0].padStart(2, '0')}:00 (${peakHour[1]} clips)`)
      parts.push('')
      parts.push('*Present this timeline as a narrative story of the user\'s clipboard activity — describe what they were working on, patterns you notice, and how their day(s) unfolded based on what they copied.*')

      return { kind: 'success', message: parts.join('\n') }
    } catch (e) {
      return { kind: 'error', message: `Failed to build timeline: ${e instanceof Error ? e.message : String(e)}` }
    }
  },
}

function formatDayLabel(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.getTime() === today.getTime()) return `Today (${dateStr})`
  if (date.getTime() === yesterday.getTime()) return `Yesterday (${dateStr})`
  return `${date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} (${dateStr})`
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default tool

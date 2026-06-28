import type { RawMarkdownFieldProps } from './RawMarkdownField.types'

const PLACEHOLDER = `<lib-chapter-break />
# Introduction

Your content here...

<lib-chapter-break />
# Getting Started

More content...

# This heading is NOT a new chapter

Use the <lib-chapter-break /> element on its own line to start a new chapter.`

export function RawMarkdownField({ value, onChange }: RawMarkdownFieldProps): React.JSX.Element {
  return (
    <textarea
      placeholder={PLACEHOLDER}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full flex-1 min-h-0 rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/30 resize-none font-mono"
    />
  )
}

import { BookOpen, Newspaper } from 'lucide-react'

import { cn } from '@/lib/utils'

import { CONTENT_TYPE_OPTIONS } from '../../NewBookDialog.constants'

import type { ContentTypePickerProps } from './ContentTypePicker.types'

const CONTENT_TYPE_ICONS = {
  book: BookOpen,
  article: Newspaper,
} as const

export function ContentTypePicker({ value, onChange }: ContentTypePickerProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-2 gap-2">
      {CONTENT_TYPE_OPTIONS.map((option) => {
        const isSelected = value === option.value
        const Icon = CONTENT_TYPE_ICONS[option.value]

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "group relative flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all duration-200 cursor-pointer",
              isSelected
                ? "border-primary bg-primary/8 text-primary shadow-sm shadow-primary/10"
                : "border-border hover:border-muted-foreground/40 text-muted-foreground hover:text-foreground hover:bg-muted/30",
            )}
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                isSelected
                  ? "bg-primary/15 text-primary"
                  : "bg-muted/50 text-muted-foreground group-hover:bg-muted group-hover:text-foreground",
              )}
            >
              <Icon size={16} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium">{option.label}</span>
              <span className="text-[11px] leading-tight opacity-60">{option.description}</span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

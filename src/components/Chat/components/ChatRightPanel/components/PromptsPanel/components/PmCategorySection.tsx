import { Tag, Plus, Pencil, Trash2, ChevronDown } from 'lucide-react'

import { IconButton } from '@/components/ui/icon-button'
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@/components/ui/context-menu'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import type { PmCategory } from '@/store/prompt-manager-store'

interface PmCategorySectionProps {
  category: PmCategory
  count: number
  children: React.ReactNode
  onAddPrompt: (categoryId: string) => void
  onEditCategory: (category: PmCategory) => void
  onDeleteCategory: (id: string) => void
}

export function PmCategorySection({
  category,
  count,
  children,
  onAddPrompt,
  onEditCategory,
  onDeleteCategory,
}: PmCategorySectionProps): React.JSX.Element {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="open"
      variant="compact"
      className="mb-3"
    >
      <AccordionItem value="open">
        {/* ── Trigger row (context-menu wraps the visible header) ── */}
        <ContextMenu>
          <ContextMenuTrigger asChild>
            <AccordionTrigger
              hideChevron
              className="flex items-center gap-1.5 mb-1.5 group/cat w-full px-0 py-0 hover:bg-transparent rounded-none"
            >
              <ChevronDown
                size={11}
                className="shrink-0 p-0 text-muted-foreground/40 transition-transform duration-150 [[data-state=closed]_&]:rotate-[-90deg] cursor-pointer"
              />
              <Tag size={10} className="shrink-0 text-muted-foreground/40" />
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50 truncate flex-1 text-left">
                {category.name}
              </span>
              <span className="text-[9px] text-muted-foreground/30 tabular-nums font-medium">
                {count}
              </span>
              <IconButton
                size="xs"
                variant="ghost"
                showOnHover
                tooltip="Add prompt"
                onClick={(e) => {
                  e.stopPropagation()
                  onAddPrompt(category.id)
                }}
              >
                <Plus size={10} />
              </IconButton>
            </AccordionTrigger>
          </ContextMenuTrigger>
          <ContextMenuContent>
            <ContextMenuItem onClick={() => onEditCategory(category)}>
              <Pencil size={14} /> Rename
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem
              className="text-destructive hover:text-destructive focus:text-destructive data-[highlighted]:text-destructive focus:bg-destructive/8 data-[highlighted]:bg-destructive/8 [&_svg]:text-destructive hover:[&_svg]:text-destructive focus:[&_svg]:text-destructive data-[highlighted]:[&_svg]:text-destructive"
              onClick={() => onDeleteCategory(category.id)}
            >
              <Trash2 size={14} /> Delete
            </ContextMenuItem>
          </ContextMenuContent>
        </ContextMenu>

        {/* ── Content ───────────────────────────────────────────── */}
        <AccordionContent className="space-y-1 ml-1 pl-2.5 border-l border-border/30 pb-0">
          {count === 0 ? (
            <button
              onClick={() => onAddPrompt(category.id)}
              className="w-full flex items-center justify-center gap-1 py-3 rounded-lg border border-dashed border-border/30 text-[10px] text-muted-foreground/30 hover:text-muted-foreground/50 hover:border-border/50 transition-all cursor-pointer"
            >
              <Plus size={10} /> Add prompt
            </button>
          ) : (
            children
          )}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

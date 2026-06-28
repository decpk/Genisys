import { useState, useCallback } from 'react'
import { Check, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { NEWS_CATEGORIES, type NewsCategoryKey } from './news-categories'

interface SelectedCategory {
  key: NewsCategoryKey
  label: string
  customPrompt: string
}

interface AddInterestDialogProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (interests: { categoryKey: string; label: string; customPrompt: string }[]) => void
  existingLabels: string[]
}

export function AddInterestDialog({
  isOpen,
  onClose,
  onAdd,
  existingLabels,
}: AddInterestDialogProps): React.JSX.Element {
  const [selected, setSelected] = useState<SelectedCategory[]>([])
  const [customLabel, setCustomLabel] = useState('')

  const handleToggle = useCallback(
    (key: NewsCategoryKey) => {
      setSelected((prev) => {
        const exists = prev.find((s) => s.key === key)
        if (exists) return prev.filter((s) => s.key !== key)

        const cat = NEWS_CATEGORIES.find((c) => c.key === key)!
        // For 'custom', label will be set separately
        return [...prev, { key, label: cat.label, customPrompt: '' }]
      })
    },
    [],
  )

  const handlePromptChange = useCallback(
    (key: NewsCategoryKey, prompt: string) => {
      setSelected((prev) =>
        prev.map((s) => (s.key === key ? { ...s, customPrompt: prompt } : s)),
      )
    },
    [],
  )

  const handleCustomLabelChange = useCallback(
    (label: string) => {
      setCustomLabel(label)
      setSelected((prev) =>
        prev.map((s) => (s.key === 'custom' ? { ...s, label } : s)),
      )
    },
    [],
  )

  const handleSave = (): void => {
    const valid = selected.filter((s) => {
      if (s.key === 'custom' && !s.label.trim()) return false
      return !existingLabels.includes(s.label)
    })
    if (valid.length === 0) return
    onAdd(valid.map((s) => ({ categoryKey: s.key, label: s.label, customPrompt: s.customPrompt })))
    setSelected([])
    setCustomLabel('')
    onClose()
  }

  const handleOpenChange = (open: boolean): void => {
    if (!open) {
      setSelected([])
      setCustomLabel('')
      onClose()
    }
  }

  const isSelected = (key: NewsCategoryKey): boolean => selected.some((s) => s.key === key)

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-card/95 backdrop-blur-xl border-border/60">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold tracking-tight">
            Curate your feed
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Pick topics you care about. You can refine each with a specific prompt.
          </DialogDescription>
        </DialogHeader>

        {/* Category Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 py-3">
          {NEWS_CATEGORIES.map((cat) => {
            const sel = isSelected(cat.key)
            const alreadyExists = existingLabels.includes(cat.label) && cat.key !== 'custom'
            const Icon = cat.icon
            return (
              <button
                key={cat.key}
                disabled={alreadyExists}
                onClick={() => handleToggle(cat.key)}
                className={`
                  relative flex flex-col items-center gap-1.5 rounded-xl p-3 border transition-all duration-200
                  cursor-pointer select-none
                  ${sel
                    ? 'border-primary ring-2 ring-primary/30 bg-primary/5'
                    : 'border-border/40 hover:border-border hover:bg-secondary/30'
                  }
                  ${alreadyExists ? 'opacity-40 cursor-not-allowed' : 'hover:-translate-y-0.5'}
                `}
              >
                {sel && (
                  <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
                    <Check size={10} className="text-primary-foreground" />
                  </div>
                )}
                <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${cat.color} flex items-center justify-center`}>
                  <Icon size={18} className="text-foreground/80" />
                </div>
                <span className="text-xs font-medium text-foreground/80">{cat.label}</span>
              </button>
            )
          })}
        </div>

        {/* Per-selection refinement inputs */}
        {selected.length > 0 && (
          <div className="space-y-3 border-t border-border/30 pt-3">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Refine your interests
            </span>
            {selected.map((s) => {
              const cat = NEWS_CATEGORIES.find((c) => c.key === s.key)!
              const Icon = cat.icon
              return (
                <div key={s.key} className="space-y-1.5">
                  {s.key === 'custom' && (
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">
                        Topic name
                      </label>
                      <Input
                        value={customLabel}
                        onChange={(e) => handleCustomLabelChange(e.target.value)}
                        placeholder="e.g. Quantum Computing, Electric Vehicles…"
                        className="h-8 text-sm"
                        autoFocus
                      />
                    </div>
                  )}
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                      <Icon size={12} />
                      Anything specific about {s.key === 'custom' ? (s.label || 'this topic') : s.label}?
                    </label>
                    <Input
                      value={s.customPrompt}
                      onChange={(e) => handlePromptChange(s.key, e.target.value)}
                      placeholder={
                        s.key === 'tech'
                          ? 'e.g. React, Rust, system design…'
                          : s.key === 'ai'
                            ? 'e.g. LLM agents, computer vision…'
                            : s.key === 'crypto'
                              ? 'e.g. Ethereum, DeFi protocols…'
                              : 'Leave empty for general news'
                      }
                      className="h-8 text-sm"
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <DialogFooter className="pt-2">
          <Button variant="ghost" onClick={onClose} size="sm">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            size="sm"
            disabled={
              selected.length === 0 ||
              (selected.some((s) => s.key === 'custom') && !customLabel.trim())
            }
            className="gap-1"
          >
            <Plus size={14} />
            Add to feed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

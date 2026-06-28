import { Pin, Plus, Sparkles, Star } from 'lucide-react'

import { Tooltip } from '@/components/Tooltip'

import { PresetEditorDialog } from '../../../PresetEditorDialog'

import { PresetGroup } from './components/PresetGroup'
import type { PresetsSectionProps } from './PresetsSection.types'
import { usePresetsSectionData } from './usePresetsSectionData'

export function PresetsSection(props: PresetsSectionProps): React.JSX.Element {
  const { onPresetSelect } = props
  const { groups, editor, setEditorOpen, openCreate, handleAction } =
    usePresetsSectionData()

  const handleSelect = (row: { preset: Parameters<typeof onPresetSelect>[0] }) =>
    onPresetSelect(row.preset)

  const newPresetButton = (
    <Tooltip content="New preset" side="bottom">
      <button
        type="button"
        onClick={openCreate}
        aria-label="New preset"
        className="flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
      >
        <Plus size={12} strokeWidth={2.5} />
      </button>
    </Tooltip>
  )

  const pinnedGroup =
    groups.pinned.length > 0 ? (
      <PresetGroup
        title="Pinned"
        icon={Pin}
        rows={groups.pinned}
        onSelect={handleSelect}
        onAction={handleAction}
      />
    ) : null

  return (
    <div className="px-2 pt-4 pb-3 flex flex-col gap-4">
      {pinnedGroup}
      <PresetGroup
        title="Quick Presets"
        icon={Sparkles}
        rows={groups.builtIn}
        onSelect={handleSelect}
        onAction={handleAction}
      />
      <PresetGroup
        title="Your Presets"
        icon={Star}
        rows={groups.custom}
        onSelect={handleSelect}
        onAction={handleAction}
        trailing={newPresetButton}
        emptyMessage="No custom presets yet — click + to create one"
      />
      <PresetEditorDialog
        open={editor.open}
        onOpenChange={setEditorOpen}
        mode={editor.mode}
        source={editor.source}
      />
    </div>
  )
}

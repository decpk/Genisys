import { memo, useCallback, useState } from 'react'
import { ChevronDown } from 'lucide-react'

import { Switch } from '@/components/ui/switch'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { AppInlineLoader } from '@/components/AppLoader'
import { DEFAULT_MODELS } from '@/components/Chat/components/ModelSelector/ModelSelector.constants'
import { useOnDemandModelSelector } from '@/components/Chat/components/ModelSelector/hooks/useOnDemandModelSelector'
import { panelToolsStyles as s } from '../AiPanelToolsSetting.styles'
import { getProviderMaxTools } from './utils/getProviderMaxTools'
import type { PanelConfigRowProps } from './PanelConfigRow.types'

export const PanelConfigRow = memo(function PanelConfigRow(props: PanelConfigRowProps): React.JSX.Element {
  const { appId, appLabel, config, chatModel, onConfigChange } = props
  const [isOpen, setIsOpen] = useState(false)
  const { groups, isLoading, fetchModels } = useOnDemandModelSelector(chatModel)

  const effectiveModel = config.model ?? chatModel
  const providerLimit = getProviderMaxTools(effectiveModel)

  const handleOpenChange = useCallback(async (open: boolean) => {
    setIsOpen(open)
    if (open) {
      await fetchModels()
    }
  }, [fetchModels])

  const handleToggleTools = useCallback(
    (checked: boolean) => onConfigChange(appId, { enableTools: checked }),
    [appId, onConfigChange],
  )

  const handleToggleRepoTools = useCallback(
    (checked: boolean) => onConfigChange(appId, { enableRepoTools: checked }),
    [appId, onConfigChange],
  )

  const handleToggleMcpTools = useCallback(
    (checked: boolean) => onConfigChange(appId, { enableMcpTools: checked }),
    [appId, onConfigChange],
  )

  const handleMaxToolsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10)
      if (!isNaN(val) && val > 0) {
        onConfigChange(appId, { maxTools: val })
      }
    },
    [appId, onConfigChange],
  )

  const handleModelSelect = useCallback(
    (modelId: string | undefined) => {
      onConfigChange(appId, { model: modelId })
    },
    [appId, onConfigChange],
  )

  const isModelOverridden = config.model !== undefined
  
  // Get all available models from the fetched groups
  const allModels = groups.flatMap(g => g.models)
  const modelLabel = allModels.find((m) => m.id === effectiveModel)?.label ?? 
                     DEFAULT_MODELS.find((m) => m.id === effectiveModel)?.label ?? 
                     effectiveModel

  const modelButtonLabel = isModelOverridden ? modelLabel : `${modelLabel} (default)`

  return (
    <div className={s.row}>
      <div className={s.rowHeader}>
        <span className={s.rowLabel}>{appLabel}</span>
        <div className="flex items-center gap-2">
          <span className={s.rowBadge}>
            {config.enableTools ? `tools: ${config.maxTools}` : 'no tools'}
          </span>
          <Switch checked={config.enableTools} onCheckedChange={handleToggleTools} />
        </div>
      </div>

      <div className={s.rowExpanded}>
        {/* Model selector */}
        <div className={s.fieldRow}>
          <span className={s.fieldLabel}>Model</span>
          <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
            <DropdownMenuTrigger asChild>
              <button type="button" className={s.modelButton}>
                <span>{modelButtonLabel}</span>
                <ChevronDown size={10} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={4}
              className="z-50 min-w-[180px] max-h-72 overflow-y-auto rounded-lg border border-border/30 bg-secondary/40 p-1 shadow-md animate-in fade-in-0 zoom-in-95"
            >
              {isLoading ? (
                <div className="flex items-center justify-center py-3">
                  <AppInlineLoader message="Loading models…" size={14} />
                </div>
              ) : groups.length === 0 ? (
                <div className="flex items-center justify-center py-3 text-xs text-muted-foreground">
                  No models available
                </div>
              ) : (
                <>
                  <DropdownMenuItem
                    onSelect={() => handleModelSelect(undefined)}
                    className="text-xs cursor-pointer"
                  >
                    Use default ({allModels.find((m) => m.id === chatModel)?.label ?? chatModel})
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {allModels.map((model) => (
                    <DropdownMenuItem
                      key={model.id}
                      onSelect={() => handleModelSelect(model.id)}
                      className="text-xs cursor-pointer"
                    >
                      <span className="flex-1">{model.label}</span>
                      <span className="text-[10px] text-muted-foreground ml-2">{model.description}</span>
                    </DropdownMenuItem>
                  ))}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tools sub-settings — only visible when tools enabled */}
        {config.enableTools && (
          <>
            <div className={s.fieldRow}>
              <span className={s.fieldLabel}>Max tools</span>
              <div className={s.fieldControl}>
                <input
                  type="number"
                  min={1}
                  max={9999}
                  value={config.maxTools}
                  onChange={handleMaxToolsChange}
                  className={s.maxToolsInput}
                />
                <span className={s.maxToolsHint}>limit: {providerLimit}</span>
              </div>
            </div>

            <div className={s.fieldRow}>
              <span className={s.fieldLabel}>Repo tools</span>
              <Switch checked={config.enableRepoTools} onCheckedChange={handleToggleRepoTools} />
            </div>

            <div className={s.fieldRow}>
              <span className={s.fieldLabel}>MCP tools</span>
              <Switch checked={config.enableMcpTools} onCheckedChange={handleToggleMcpTools} />
            </div>
          </>
        )}
      </div>
    </div>
  )
})

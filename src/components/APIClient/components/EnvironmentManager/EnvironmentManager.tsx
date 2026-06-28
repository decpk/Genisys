import { useState, useCallback, useEffect } from 'react'
import { Plus, Trash2, ChevronDown, ChevronRight, Variable, Eye, EyeOff, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PanelHeading } from '@/components/ui/panel-heading'
import { EmptyState } from '@/components/ui/empty-state'
import { Tooltip } from '@/components/Tooltip/Tooltip'
import { useApiClientStore } from '@/store/api-client-store'
import { useConfirmDialogStore } from '@/store/confirm-dialog-store'
import type { ApiEnvironment, ApiEnvironmentVariable } from '../../APIClient.types'

const ENV_COLORS = [
  { key: 'green', label: 'Green', dot: 'bg-emerald-400' },
  { key: 'blue', label: 'Blue', dot: 'bg-blue-400' },
  { key: 'orange', label: 'Orange', dot: 'bg-orange-400' },
  { key: 'purple', label: 'Purple', dot: 'bg-purple-400' },
  { key: 'red', label: 'Red', dot: 'bg-red-400' },
  { key: 'cyan', label: 'Cyan', dot: 'bg-cyan-400' },
  { key: 'pink', label: 'Pink', dot: 'bg-pink-400' },
]

function getEnvDotClass(color: string): string {
  return ENV_COLORS.find((c) => c.key === color)?.dot ?? 'bg-muted-foreground/40'
}

export function EnvironmentManager(): React.JSX.Element {
  const environments = useApiClientStore((s) => s.environments)
  const activeEnvironmentId = useApiClientStore((s) => s.activeEnvironmentId)
  const environmentVariables = useApiClientStore((s) => s.environmentVariables)
  const addEnvironment = useApiClientStore((s) => s.addEnvironment)
  const updateEnvironment = useApiClientStore((s) => s.updateEnvironment)
  const removeEnvironment = useApiClientStore((s) => s.removeEnvironment)
  const setActiveEnvironment = useApiClientStore((s) => s.setActiveEnvironment)
  const loadEnvironmentVariables = useApiClientStore((s) => s.loadEnvironmentVariables)
  const addEnvironmentVariable = useApiClientStore((s) => s.addEnvironmentVariable)
  const updateEnvironmentVariable = useApiClientStore((s) => s.updateEnvironmentVariable)
  const removeEnvironmentVariable = useApiClientStore((s) => s.removeEnvironmentVariable)
  const openConfirmDialog = useConfirmDialogStore((s) => s.openConfirmDialog)

  const [expandedEnvId, setExpandedEnvId] = useState<string | null>(null)
  const [newEnvName, setNewEnvName] = useState('')
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (expandedEnvId) {
      loadEnvironmentVariables(expandedEnvId)
    }
  }, [expandedEnvId, loadEnvironmentVariables])

  const handleAddEnvironment = useCallback(async () => {
    const name = newEnvName.trim()
    if (!name) return
    const colors = ENV_COLORS.map((c) => c.key)
    const color = colors[environments.length % colors.length]
    await addEnvironment(name, color)
    setNewEnvName('')
  }, [newEnvName, environments.length, addEnvironment])

  const handleToggleExpand = useCallback((envId: string) => {
    setExpandedEnvId((prev) => (prev === envId ? null : envId))
  }, [])

  const handleAddVariable = useCallback(async (envId: string) => {
    await addEnvironmentVariable(envId, '', '')
  }, [addEnvironmentVariable])

  const toggleSecret = useCallback((varId: string) => {
    setShowSecrets((prev) => ({ ...prev, [varId]: !prev[varId] }))
  }, [])

  return (
    <div className="flex flex-col h-full">
      <PanelHeading icon={Globe} title="Environments" count={environments.length} />

      {/* Add environment */}
      <div className="px-2.5 pt-2 pb-1.5 flex gap-1.5">
        <input
          type="text"
          value={newEnvName}
          onChange={(e) => setNewEnvName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddEnvironment()}
          placeholder="New environment name..."
          className="flex-1 h-7 px-2 text-xs bg-muted/20 border border-transparent rounded-md outline-none placeholder:text-muted-foreground/40 focus:border-input focus:ring-1 focus:ring-ring/20"
        />
        <Button
          onClick={handleAddEnvironment}
          disabled={!newEnvName.trim()}
          size="sm"
          variant="ghost"
          className="h-7 w-7 p-0"
        >
          <Plus size={14} />
        </Button>
      </div>

      <div className="h-px bg-border/20 mx-2.5" />

      {/* Environment list */}
      <div className="flex-1 overflow-y-auto px-1.5 py-1.5">
        {environments.length === 0 ? (
          <EmptyState icon={Globe} message="No environments yet" />
        ) : (
          environments.map((env) => {
            const isExpanded = expandedEnvId === env.id
            const isActive = env.id === activeEnvironmentId
            const vars = environmentVariables[env.id] ?? []

            return (
              <div key={env.id} className="mb-1">
                {/* Environment header */}
                <div
                  className={`flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer transition-colors group
                    ${isActive ? 'bg-primary/10 border border-primary/20' : 'hover:bg-muted/30'}`}
                >
                  <button onClick={() => handleToggleExpand(env.id)} className="p-0.5">
                    {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  </button>
                  <span className={`inline-block size-2.5 rounded-full ${getEnvDotClass(env.color)}`} />
                  <button
                    onClick={() => setActiveEnvironment(isActive ? null : env.id)}
                    className="flex-1 text-left text-xs font-medium truncate"
                  >
                    {env.name}
                  </button>
                  {isActive && (
                    <span className="text-3xs uppercase tracking-wider text-emerald-400 font-bold">Active</span>
                  )}
                  <Tooltip content="Delete" side="left">
                    <button
                      onClick={() =>
                        openConfirmDialog({
                          title: 'Delete environment',
                          description: `Are you sure you want to delete "${env.name}"? All variables inside will be permanently removed. This action cannot be undone.`,
                          onConfirm: () => removeEnvironment(env.id),
                        })
                      }
                      className="p-0.5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all"
                    >
                      <Trash2 size={11} />
                    </button>
                  </Tooltip>
                </div>

                {/* Variables editor */}
                {isExpanded && (
                  <div className="ml-4 mt-1 mb-2">
                    {/* Base URL */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-2xs text-muted-foreground/60 w-16 shrink-0">Base URL</span>
                      <input
                        type="text"
                        value={env.baseUrl}
                        onChange={(e) => updateEnvironment(env.id, { baseUrl: e.target.value })}
                        placeholder="https://api.example.com"
                        className="flex-1 h-6 px-1.5 text-xs font-sans bg-muted/10 border border-transparent rounded outline-none placeholder:text-muted-foreground/30 focus:border-input focus:ring-1 focus:ring-ring/20"
                      />
                    </div>

                    {/* Variable rows */}
                    <div className="text-2xs uppercase tracking-wider text-muted-foreground/40 font-medium mb-1 flex items-center gap-1">
                      <Variable size={10} />
                      Variables ({vars.length})
                    </div>

                    {vars.map((v) => (
                      <VariableRow
                        key={v.id}
                        variable={v}
                        showSecret={showSecrets[v.id] ?? false}
                        onToggleSecret={() => toggleSecret(v.id)}
                        onUpdate={(updates) => updateEnvironmentVariable(v.id, updates)}
                        onRemove={() =>
                          openConfirmDialog({
                            title: 'Delete variable',
                            description: 'Are you sure you want to delete this variable? This action cannot be undone.',
                            onConfirm: () => removeEnvironmentVariable(v.id, env.id),
                          })
                        }
                      />
                    ))}

                    <button
                      onClick={() => handleAddVariable(env.id)}
                      className="flex items-center gap-1 text-xs text-muted-foreground/50 hover:text-muted-foreground mt-1 transition-colors"
                    >
                      <Plus size={11} /> Add variable
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ─── Variable Row ────────────────────────────────────────────────

interface VariableRowProps {
  variable: ApiEnvironmentVariable
  showSecret: boolean
  onToggleSecret: () => void
  onUpdate: (updates: Partial<ApiEnvironmentVariable>) => void
  onRemove: () => void
}

function VariableRow(props: VariableRowProps): React.JSX.Element {
  const { variable, showSecret, onToggleSecret, onUpdate, onRemove } = props

  const displayValue = variable.isSecret && !showSecret ? '••••••••' : variable.value

  return (
    <div className="flex items-center gap-1 mb-0.5 group">
      <input
        type="text"
        value={variable.key}
        onChange={(e) => onUpdate({ key: e.target.value })}
        placeholder="KEY"
        className="w-24 h-5.5 px-1.5 text-xs font-sans bg-muted/10 border border-transparent rounded outline-none placeholder:text-muted-foreground/30 focus:border-input focus:ring-1 focus:ring-ring/20"
      />
      <span className="text-muted-foreground/30 text-2xs">=</span>
      <input
        type={variable.isSecret && !showSecret ? 'password' : 'text'}
        value={variable.value}
        onChange={(e) => onUpdate({ value: e.target.value })}
        placeholder="value"
        className="flex-1 h-5.5 px-1.5 text-xs font-sans bg-muted/10 border border-transparent rounded outline-none placeholder:text-muted-foreground/30 focus:border-input focus:ring-1 focus:ring-ring/20"
      />
      <button
        onClick={() => onUpdate({ isSecret: !variable.isSecret })}
        className={`p-0.5 transition-colors ${variable.isSecret ? 'text-amber-400' : 'text-muted-foreground/30 hover:text-muted-foreground'}`}
        title={variable.isSecret ? 'Secret (click to unmark)' : 'Mark as secret'}
      >
        {variable.isSecret ? <EyeOff size={11} /> : <Eye size={11} />}
      </button>
      {variable.isSecret && (
        <button onClick={onToggleSecret} className="p-0.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors">
          {showSecret ? <EyeOff size={10} /> : <Eye size={10} />}
        </button>
      )}
      <button
        onClick={onRemove}
        className="p-0.5 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all"
      >
        <Trash2 size={10} />
      </button>
    </div>
  )
}

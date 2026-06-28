import { useMemo } from 'react'
import { Globe, Plus, ChevronDown, Check } from 'lucide-react'
import { Dropdown } from '@/components/ui/dropdown'
import type { DropdownItem } from '@/components/ui/dropdown'
import { useApiClientStore } from '@/store/api-client-store'

const ENV_COLORS: Record<string, string> = {
  green: 'bg-emerald-400',
  blue: 'bg-blue-400',
  orange: 'bg-orange-400',
  purple: 'bg-purple-400',
  red: 'bg-red-400',
  cyan: 'bg-cyan-400',
  pink: 'bg-pink-400',
  yellow: 'bg-yellow-400',
}

function getEnvDotColor(color: string): string {
  return ENV_COLORS[color] ?? 'bg-muted-foreground/40'
}

export function EnvironmentSelector(): React.JSX.Element {
  const environments = useApiClientStore((s) => s.environments)
  const activeEnvironmentId = useApiClientStore((s) => s.activeEnvironmentId)
  const setActiveEnvironment = useApiClientStore((s) => s.setActiveEnvironment)
  const setSidebarTab = useApiClientStore((s) => s.setSidebarTab)

  const activeEnv = environments.find((e) => e.id === activeEnvironmentId)

  const items: DropdownItem[] = useMemo(() => {
    const envItems: DropdownItem[] = environments.map((env) => ({
      key: env.id,
      label: env.name,
      active: env.id === activeEnvironmentId,
      prefix: <span className={`inline-block size-2 rounded-full ${getEnvDotColor(env.color)}`} />,
      suffix: env.id === activeEnvironmentId ? <Check size={12} className="text-emerald-400" /> : undefined,
      onSelect: () => setActiveEnvironment(env.id),
    }))

    const noEnv: DropdownItem = {
      key: 'none',
      label: 'No Environment',
      active: !activeEnvironmentId,
      prefix: <span className="inline-block size-2 rounded-full bg-muted-foreground/30" />,
      suffix: !activeEnvironmentId ? <Check size={12} className="text-emerald-400" /> : undefined,
      onSelect: () => setActiveEnvironment(null),
    }

    const manage: DropdownItem = {
      key: '__manage',
      label: 'Manage Environments',
      prefix: <Plus size={12} className="text-muted-foreground" />,
      onSelect: () => setSidebarTab('environments'),
    }

    return [noEnv, ...envItems, { key: '__divider', label: '---', onSelect: () => {} }, manage]
  }, [environments, activeEnvironmentId, setActiveEnvironment, setSidebarTab])

  return (
    <Dropdown
      items={items}
      openOn="click"
      align="right"
      menuWidth="200px"
      trigger={
        <button
          className="flex items-center gap-1.5 px-2.5 h-8 text-xs font-medium rounded-lg
                     text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all
                     border border-border/30 cursor-pointer"
        >
          <Globe size={12} className={activeEnv ? 'text-emerald-400' : ''} />
          <span className="max-w-[100px] truncate">
            {activeEnv ? activeEnv.name : 'No Env'}
          </span>
          <ChevronDown size={10} className="opacity-50" />
        </button>
      }
    />
  )
}

import {
  Sparkles,
  SpellCheck,
  BookOpen,
  FileCode,
  Languages,
  Braces,
  ArrowRightLeft,
  Table,
  RemoveFormatting,
  CaseSensitive,
  Wand2,
} from 'lucide-react'
import {
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuItem,
  ContextMenuSeparator,
} from '@/components/ui/context-menu'
import { AppInlineLoader } from '@/components/AppLoader'
import { getTransformConfig } from '../../utils/ai-transform'
import { useTransformMenuData } from './useTransformMenuData'
import { TRANSFORM_GROUPS } from './TransformMenu.constants'
import type { TransformMenuProps } from './TransformMenu.types'

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Sparkles,
  SpellCheck,
  BookOpen,
  FileCode,
  Languages,
  Braces,
  ArrowRightLeft,
  Table,
  RemoveFormatting,
  CaseSensitive,
}

export function TransformMenu(props: TransformMenuProps): React.JSX.Element {
  const { text, onTransformComplete } = props
  const { isTransforming, activeAction, handleTransform } = useTransformMenuData(text, onTransformComplete)

  return (
    <ContextMenuSub>
      <ContextMenuSubTrigger>
        <Wand2 size={14} className="mr-2" />
        Transform
        {isTransforming && <AppInlineLoader size={12} />}
      </ContextMenuSubTrigger>
      <ContextMenuSubContent className="w-56 max-h-[70vh] overflow-y-auto">
        {TRANSFORM_GROUPS.map((group, groupIndex) => {
          const items = group.actions.map((action) => {
            const config = getTransformConfig(action)
            if (!config) return null

            const Icon = ICON_MAP[config.icon]
            const isActive = activeAction === action

            return (
              <ContextMenuItem
                key={action}
                disabled={isTransforming}
                className="py-1.5 text-xs"
                onClick={(e) => {
                  e.preventDefault()
                  handleTransform(action)
                }}
              >
                {isActive ? (
                  <AppInlineLoader size={12} className="mr-1.5" />
                ) : Icon ? (
                  <Icon size={12} className="mr-1.5" />
                ) : null}
                <span>{config.label}</span>
                {config.requiresAI && !isActive && (
                  <Sparkles size={9} className="ml-auto text-amber-400 opacity-60" />
                )}
              </ContextMenuItem>
            )
          })

          return (
            <div key={group.label}>
              {groupIndex > 0 && <ContextMenuSeparator className="my-0.5" />}
              <div className="px-2 py-0.5">
                <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-wider">
                  {group.label}
                </span>
              </div>
              {items}
            </div>
          )
        })}
      </ContextMenuSubContent>
    </ContextMenuSub>
  )
}

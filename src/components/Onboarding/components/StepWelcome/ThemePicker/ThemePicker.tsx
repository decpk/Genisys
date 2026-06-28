import { Check } from 'lucide-react'

import { THEMES } from '@/themes'
import { useThemeStore } from '@/store/theme-store'

const FEATURED_THEMES = [
  'midnight-orange',
  'tokyo-night',
  'catppuccin-mocha',
  'dracula',
  'nord',
  'rose-pine',
  'github-dark',
  'one-dark-pro',
  'github-light',
  'catppuccin-latte',
  'solarized-light',
  'rose-pine-dawn',
] as const

export function ThemePicker(): React.JSX.Element {
  const activeThemeId = useThemeStore((s) => s.activeThemeId)
  const setTheme = useThemeStore((s) => s.setTheme)
  const previewTheme = useThemeStore((s) => s.previewTheme)
  const revertPreview = useThemeStore((s) => s.revertPreview)

  const featured = FEATURED_THEMES.map((id) => THEMES.find((t) => t.id === id)).filter(Boolean)

  return (
    <div className="mt-12 flex flex-col items-center gap-4">
      <p className="text-xs text-muted-foreground/40 uppercase tracking-wider font-medium">
        Choose a theme
      </p>
      <div className="flex flex-wrap justify-center gap-2.5 max-w-md">
        {featured.map((theme) => {
          if (!theme) return null
          const isActive = theme.id === activeThemeId

          const ringColor = isActive
            ? `hsl(${theme.colors.primary})`
            : 'rgba(255,255,255,0.12)'

          return (
            <button
              key={theme.id}
              onClick={() => setTheme(theme.id)}
              onMouseEnter={() => previewTheme(theme.id)}
              onMouseLeave={() => revertPreview()}
              className="group relative w-10 h-10 rounded-xl transition-all duration-150 flex items-center justify-center hover:scale-110"
              style={{
                backgroundColor: `hsl(${theme.colors.background})`,
                boxShadow: `0 0 0 ${isActive ? '2px' : '1.5px'} ${ringColor}`,
              }}
              title={theme.name}
            >
              <span
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: `hsl(${theme.colors.primary})` }}
              />
              {isActive && (
                <div
                  className="absolute inset-0 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `hsl(${theme.colors.primary} / 0.2)` }}
                >
                  <Check size={16} style={{ color: `hsl(${theme.colors.primary})` }} />
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

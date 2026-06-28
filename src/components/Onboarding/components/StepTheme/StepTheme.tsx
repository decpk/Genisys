import { Sun, Moon } from 'lucide-react'

import { useStepThemeData } from './useStepThemeData'
import { STEP_THEME_STYLES } from './StepTheme.styles'
import { ThemeTabButton } from './components/ThemeTabButton'
import { ThemeCard } from './components/ThemeCard'

export function StepTheme(): React.JSX.Element {
  const { activeThemeId, setTheme, mode, setMode, themes } = useStepThemeData()

  const handleSelectDark = () => {
    setMode('dark')
  }

  const handleSelectLight = () => {
    setMode('light')
  }

  return (
    <div className={STEP_THEME_STYLES.root}>
      <h2 className={STEP_THEME_STYLES.heading}>Make it yours</h2>
      <p className={STEP_THEME_STYLES.subheading}>Pick a theme. You can change it anytime.</p>

      <div className={STEP_THEME_STYLES.tabBar}>
        <ThemeTabButton active={mode === 'dark'} onClick={handleSelectDark}>
          <Moon size={13} />
          Dark
        </ThemeTabButton>
        <ThemeTabButton active={mode === 'light'} onClick={handleSelectLight}>
          <Sun size={13} />
          Light
        </ThemeTabButton>
      </div>

      <div className={STEP_THEME_STYLES.grid}>
        {themes.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            isActive={theme.id === activeThemeId}
            onSelect={setTheme}
          />
        ))}
      </div>
    </div>
  )
}

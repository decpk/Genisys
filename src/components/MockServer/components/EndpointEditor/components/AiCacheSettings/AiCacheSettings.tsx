import { useAiCacheSettingsData } from './useAiCacheSettingsData'
import type { AiCacheSettingsProps } from './AiCacheSettings.types'
import { aiCacheSettingsStyles as styles } from './AiCacheSettings.styles'

export function AiCacheSettings(props: AiCacheSettingsProps) {
  const {
    mode,
    cacheTtlMs,
    setCacheTtlMs,
    poolSize,
    setPoolSize,
    poolMin,
    poolMax,
    ttlMin,
  } = useAiCacheSettingsData(props)

  if (mode === 'live') return null

  if (mode === 'cached') {
    return (
      <div className={styles.root}>
        <label className={styles.label}>Cache TTL (ms)</label>
        <input
          type="number"
          min={ttlMin}
          step={1000}
          value={cacheTtlMs}
          onChange={(e) => setCacheTtlMs(Number(e.target.value))}
          className={styles.input}
        />
      </div>
    )
  }

  return (
    <div className={styles.root}>
      <label className={styles.label}>Pool size</label>
      <input
        type="number"
        min={poolMin}
        max={poolMax}
        step={1}
        value={poolSize}
        onChange={(e) => setPoolSize(Number(e.target.value))}
        className={styles.input}
      />
    </div>
  )
}

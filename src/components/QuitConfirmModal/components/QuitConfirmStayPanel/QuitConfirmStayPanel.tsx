import { useQuitConfirmLiveSignals } from '../../hooks/useQuitConfirmLiveSignals'

import {
  QUIT_CONFIRM_MARQUEE_FEATURES,
  QUIT_CONFIRM_STAY_EYEBROW,
  QUIT_CONFIRM_STAY_FOOTER,
  QUIT_CONFIRM_STAY_HEADLINE,
  QUIT_CONFIRM_STAY_SUBHEAD,
} from './QuitConfirmStayPanel.constants'
import { quitConfirmStayPanelStyles as styles } from './QuitConfirmStayPanel.styles'

const STAY_HEADLINE_ID = 'quit-confirm-stay-headline'

export function QuitConfirmStayPanel(): React.JSX.Element {
  const { runningTimers, clipboardCount } = useQuitConfirmLiveSignals()
  const hasLiveSignals = runningTimers > 0 || clipboardCount > 0

  return (
    <section className={styles.root} aria-labelledby={STAY_HEADLINE_ID}>
      <div className={styles.header}>
        <span className={styles.eyebrow}>
          <span className={styles.eyebrowDot} aria-hidden="true" />
          {QUIT_CONFIRM_STAY_EYEBROW}
        </span>
        <h2 id={STAY_HEADLINE_ID} className={styles.headline}>
          {QUIT_CONFIRM_STAY_HEADLINE}
        </h2>
        <p className={styles.subhead}>{QUIT_CONFIRM_STAY_SUBHEAD}</p>
      </div>

      <ul className={styles.grid}>
        {QUIT_CONFIRM_MARQUEE_FEATURES.map((feature) => {
          const Icon = feature.icon
          return (
            <li key={feature.id} className={styles.tile}>
              <span className={styles.tileIconWrap} aria-hidden="true">
                <Icon className={styles.tileIcon} />
              </span>
              <span className={styles.tileBody}>
                <span className={styles.tileLabel}>{feature.label}</span>
                <span className={styles.tileTagline}>{feature.tagline}</span>
              </span>
            </li>
          )
        })}
      </ul>

      {hasLiveSignals ? (
        <div className={styles.liveStrip} aria-label="What's currently active in Genisys">
          <span className={styles.liveLabel}>Right now</span>
          {runningTimers > 0 ? (
            <span className={styles.chip}>
              <span className={styles.chipDot} aria-hidden="true">
                <span className={styles.chipDotPulse} />
                <span className={styles.chipDotCore} />
              </span>
              <span className={styles.chipCount}>{runningTimers}</span>
              {runningTimers === 1 ? 'timer running' : 'timers running'}
            </span>
          ) : null}
          {clipboardCount > 0 ? (
            <span className={styles.chip}>
              <span className={styles.chipDot} aria-hidden="true">
                <span className={styles.chipDotPulse} />
                <span className={styles.chipDotCore} />
              </span>
              <span className={styles.chipCount}>{clipboardCount}</span>
              {clipboardCount === 1 ? 'clipboard item' : 'clipboard items'}
            </span>
          ) : null}
        </div>
      ) : null}

      <p className={styles.footer}>{QUIT_CONFIRM_STAY_FOOTER}</p>
    </section>
  )
}

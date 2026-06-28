import { SECTION_META } from '../Settings.constants'
import { SettingsSectionContent } from '../SettingsSectionContent'

import { settingsSectionShellStyles as styles } from './SettingsSectionShell.styles'
import type { SettingsSectionShellProps } from './SettingsSectionShell.types'
import { isFullPageSection } from './utils/isFullPageSection'

/**
 * Wraps `SettingsSectionContent` with a standard title + description
 * header for "regular" sections. Self-rendering sections like
 * `about` / `keyboard` / `notifications` are rendered bare.
 *
 * This is the single source of truth for how a section is displayed —
 * used by both the full `Settings` app and the `SettingsSidePanel`
 * drawer.
 */
export function SettingsSectionShell(props: SettingsSectionShellProps): React.JSX.Element {
  const { section } = props
  const isFullPage = isFullPageSection(section)

  if (isFullPage) {
    return <SettingsSectionContent section={section} />
  }

  const { title, description } = SECTION_META[section]

  return (
    <div>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>
      <div className={styles.divider}>
        <SettingsSectionContent section={section} />
      </div>
    </div>
  )
}

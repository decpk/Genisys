import { Suspense } from 'react'

import { AppLoader } from '@/components/AppLoader'
import { ErrorBoundary } from '@/components/ErrorBoundary'

import { SECTION_META } from '../../../Settings.constants'
import { SettingsSectionContent } from '../../../SettingsSectionContent'

import { settingsSearchSectionBlockStyles as styles } from './SettingsSearchSectionBlock.styles'
import type { SettingsSearchSectionBlockProps } from './SettingsSearchSectionBlock.types'

/**
 * Renders one matched section inline in the flat search results. The section's
 * own `SettingRow`s self-filter (hiding non-matching rows) via search context.
 */
export function SettingsSearchSectionBlock(
  props: SettingsSearchSectionBlockProps,
): React.JSX.Element {
  const { section } = props
  const { title } = SECTION_META[section]

  const fallback = (
    <div className={styles.loader}>
      <AppLoader />
    </div>
  )

  return (
    <section className={styles.root}>
      <h2 className={styles.heading}>{title}</h2>
      <ErrorBoundary componentName={`Settings search — ${title}`}>
        <Suspense fallback={fallback}>
          <div className={styles.body}>
            <SettingsSectionContent section={section} />
          </div>
        </Suspense>
      </ErrorBoundary>
    </section>
  )
}

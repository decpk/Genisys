import { SettingsSearchCard } from './components/SettingsSearchCard'
import { SettingsSearchEmpty } from './components/SettingsSearchEmpty'
import { SettingsSearchSectionBlock } from "./components/SettingsSearchSectionBlock";
import { settingsSearchResultsStyles as styles } from './SettingsSearchResults.styles'
import type { SettingsSearchResultsProps } from './SettingsSearchResults.types'

export function SettingsSearchResults(props: SettingsSearchResultsProps): React.JSX.Element {
  const { result, onNavigate } = props;
  const { inlineSections, cards } = result

  const hasResults = inlineSections.length > 0 || cards.length > 0
  if (!hasResults) {
    return <SettingsSearchEmpty />;
  }

  let cardsBlock: React.ReactNode = null
  if (cards.length > 0) {
    cardsBlock = (
      <div className={styles.cardsGrid}>
        {cards.map((card) => (
          <SettingsSearchCard key={card.id} card={card} onNavigate={onNavigate} />
        ))}
      </div>
    )
  }

  return (
    <div className={styles.root}>
      {inlineSections.map((section) => (
        <SettingsSearchSectionBlock key={section} section={section} />
      ))}
      {cardsBlock}
    </div>
  );
}

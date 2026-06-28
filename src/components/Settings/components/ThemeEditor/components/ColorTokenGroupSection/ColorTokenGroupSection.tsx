import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

import { THEME_TOKEN_CATALOG } from '@/themes/themeTokenCatalog'

import type { ColorTokenGroupSectionProps } from '../../ThemeEditor.types'
import { STYLES } from '../../ThemeEditor.styles'
import { ColorTokenField } from '../ColorTokenField'

export function ColorTokenGroupSection(props: ColorTokenGroupSectionProps): React.JSX.Element {
  const { group, groupLabel, groupDescription, draft, onChangeColor, defaultExpanded = true } = props
  const [expanded, setExpanded] = useState(defaultExpanded)

  const tokens = THEME_TOKEN_CATALOG.filter((t) => t.group === group)

  let chevron: React.ReactNode
  if (expanded) {
    chevron = <ChevronDown size={14} />
  } else {
    chevron = <ChevronRight size={14} />
  }

  let bodyContent: React.ReactNode = null
  if (expanded) {
    const fields = tokens.map((token) => (
      <ColorTokenField
        key={token.key}
        tokenKey={token.key}
        label={token.label}
        description={token.description}
        exampleUsage={token.exampleUsage}
        optional={token.optional ?? false}
        value={draft.colors[token.key]}
        onChange={(next) => onChangeColor(token.key, next)}
      />
    ))
    bodyContent = <div className={STYLES.groupGrid}>{fields}</div>
  }

  return (
    <div className={STYLES.groupSection}>
      <button
        type="button"
        className={STYLES.groupHeader}
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          {chevron}
          <span className={STYLES.groupTitle}>{groupLabel}</span>
        </div>
        <span className="text-[10px] text-muted-foreground/70">{tokens.length} tokens</span>
      </button>
      <p className="text-[11px] text-muted-foreground/80 leading-relaxed pl-5 -mt-1">{groupDescription}</p>
      {bodyContent}
    </div>
  )
}

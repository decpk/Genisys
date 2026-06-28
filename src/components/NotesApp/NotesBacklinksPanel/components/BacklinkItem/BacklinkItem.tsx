import type { BacklinkItemProps } from './BacklinkItem.types'
import { useBacklinkItemData } from './useBacklinkItemData'
import { buttonStyles, snippetStyles, titleStyles } from './BacklinkItem.styles'

export function BacklinkItem(props: BacklinkItemProps): React.JSX.Element {
  const { item } = props
  const { handleClick } = useBacklinkItemData(props)

  return (
    <button type="button" onClick={handleClick} className={buttonStyles}>
      <span className={titleStyles}>{item.title}</span>
      <span className={snippetStyles}>{item.snippet}</span>
    </button>
  )
}

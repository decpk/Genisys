import { FOCUS_MODE_CLASS, FOCUS_NAME_CLASS, FOCUS_TITLE_WRAP_CLASS } from '../../FocusCardLayout.styles'

import type { FocusTitleProps } from './FocusTitle.types'

export function FocusTitle(props: FocusTitleProps): React.JSX.Element {
  const { name, mode } = props
  return (
    <div className={FOCUS_TITLE_WRAP_CLASS}>
      <h2 className={FOCUS_NAME_CLASS}>{name}</h2>
      <span className={FOCUS_MODE_CLASS}>{mode}</span>
    </div>
  )
}

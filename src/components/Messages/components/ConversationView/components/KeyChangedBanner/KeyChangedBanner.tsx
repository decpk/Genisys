import { ShieldAlert } from 'lucide-react'

import { keyChangedBannerStyles as s } from './KeyChangedBanner.styles'
import type { KeyChangedBannerProps } from './KeyChangedBanner.types'

export function KeyChangedBanner(props: KeyChangedBannerProps): React.JSX.Element {
  const { peerName } = props

  return (
    <div className={s.root}>
      <ShieldAlert className={s.icon} />
      <div className={s.body}>
        <span className={s.title}>Safety number changed. </span>
        <span className={s.text}>
          {peerName}&rsquo;s encryption key is different from before. This can
          happen after a reinstall — or could indicate someone is intercepting
          the connection. Verify their safety number before sharing anything
          sensitive.
        </span>
      </div>
    </div>
  )
}

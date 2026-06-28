import type { SlideFramesProps } from './SlideFrames.types'

const SLIDE_SANDBOX = 'allow-scripts'

/**
 * The two persistent, crossfading sandboxed iframes that render a slide. Both
 * frames stay mounted (stable keys) so navigation never flashes a reload; the
 * caller positions this inside a sized, relatively-positioned box.
 */
export function SlideFrames(props: SlideFramesProps): React.JSX.Element {
  const { docA, docB, front, fadeMs, onLoadA, onLoadB } = props
  const transition = `opacity ${fadeMs}ms ease`
  const styleA: React.CSSProperties = { opacity: front === 'a' ? 1 : 0, transition }
  const styleB: React.CSSProperties = { opacity: front === 'b' ? 1 : 0, transition }

  return (
    <>
      <iframe
        key="a"
        title="Slide buffer A"
        sandbox={SLIDE_SANDBOX}
        srcDoc={docA ?? undefined}
        onLoad={onLoadA}
        style={styleA}
        className="absolute inset-0 h-full w-full border-0"
      />
      <iframe
        key="b"
        title="Slide buffer B"
        sandbox={SLIDE_SANDBOX}
        srcDoc={docB ?? undefined}
        onLoad={onLoadB}
        style={styleB}
        className="absolute inset-0 h-full w-full border-0"
      />
    </>
  )
}

import {
  TYPING_DOT_DELAYS,
  typingIndicatorStyles as s,
} from './TypingIndicator.styles'

export function TypingIndicator(): React.JSX.Element {
  return (
    <div className={s.root}>
      {TYPING_DOT_DELAYS.map((delay) => (
        <span key={delay} className={s.dot} style={{ animationDelay: delay }} />
      ))}
    </div>
  )
}

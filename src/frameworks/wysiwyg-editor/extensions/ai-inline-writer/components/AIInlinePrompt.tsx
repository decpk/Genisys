import { Sparkles, AlertTriangle, Check } from 'lucide-react'
import { AppLoaderGlyph } from '@/components/AppLoader'
import { useAIInlinePromptData } from './useAIInlinePromptData'
import { aiInlineWriterStyles as s } from './AIInlinePrompt.styles'
import type { AIInlinePromptProps } from './AIInlinePrompt.types'

export function AIInlinePrompt(props: AIInlinePromptProps): React.JSX.Element {
  const {
    input,
    setInput,
    status,
    errorMsg,
    tokenCount,
    inputRef,
    handleKeyDown,
    handleStop,
  } = useAIInlinePromptData(props)

  const { onClose, position } = props

  const isStreaming = status === 'streaming'

  const positionStyle: React.CSSProperties = {
    top: position.top,
    left: position.left,
  }

  return (
    <>
      {/* Backdrop to catch clicks outside */}
      <div className={s.overlay} onClick={onClose} />

      <div className={s.container} style={positionStyle}>
        <div className={s.inputRow}>
          <Sparkles size={14} className={s.icon} />
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask AI to write… (Enter to submit)"
            className={s.input}
            disabled={isStreaming}
          />
        </div>

        {status === 'idle' && (
          <div className={s.statusBar}>
            <span>⌘J to toggle · Enter to submit · Esc to dismiss</span>
          </div>
        )}

        {isStreaming && (
          <div className={s.streamingBar}>
            <AppLoaderGlyph size={10} />
            <span>Writing… ({tokenCount} chunks)</span>
            <button type="button" onClick={handleStop} className={s.stopButton}>
              Stop
            </button>
          </div>
        )}

        {status === 'done' && (
          <div className={s.doneBar}>
            <Check size={10} />
            <span>Done</span>
            <button type="button" onClick={onClose} className={s.stopButton}>
              Close
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className={s.errorBar}>
            <AlertTriangle size={10} />
            <span>{errorMsg}</span>
            <button type="button" onClick={onClose} className={s.stopButton}>
              Close
            </button>
          </div>
        )}
      </div>
    </>
  )
}

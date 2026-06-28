import { Sparkles, RefreshCw } from 'lucide-react'
import { Tooltip } from '@/components/Tooltip'
import { AppLoaderGlyph } from '@/components/AppLoader'
import { useMotivationalQuoteData } from './useMotivationalQuoteData'

export function MotivationalQuote(): React.JSX.Element {
  const { quote, isLoading, handleShuffle } = useMotivationalQuoteData()

  return (
    <div className="flex items-center gap-2.5 px-4 py-2 border-t border-border/50 bg-card/50 shrink-0">
      <Sparkles className="size-3.5 text-primary/50 shrink-0" />
      <p className="text-xs italic text-muted-foreground leading-relaxed truncate min-w-0 flex-1">
        {quote.text}
        <span className="not-italic text-muted-foreground/50 ml-1.5">— {quote.author}</span>
      </p>
      <Tooltip content="Get AI quote">
        <button
          type="button"
          onClick={handleShuffle}
          disabled={isLoading}
          className="shrink-0 p-1 rounded-md text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted transition-colors disabled:pointer-events-none"
        >
          {isLoading ? <AppLoaderGlyph size={12} /> : <RefreshCw className="size-3" />}
        </button>
      </Tooltip>
    </div>
  )
}

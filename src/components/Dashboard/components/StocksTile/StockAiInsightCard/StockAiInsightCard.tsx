import { AlertTriangle, Handshake, Info, RefreshCw, Sparkles, TrendingUp, X } from 'lucide-react'

import { AppLoaderGlyph } from '@/components/AppLoader'
import { Button } from '@/components/ui/button'
import { Tooltip } from '@/components/Tooltip'
import { relativeTime } from '@/lib/format'

import type { StockAiInsightCardProps } from './StockAiInsightCard.types'

const CONFIDENCE_STYLES: Record<string, string> = {
  low: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  medium: 'bg-sky-500/10 text-sky-500 border-sky-500/20',
  high: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
}

function ConfidenceChip({ value }: { value: 'low' | 'medium' | 'high' }) {
  const cls = CONFIDENCE_STYLES[value] ?? CONFIDENCE_STYLES.low
  return (
    <span
      className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] uppercase tracking-wide font-medium ${cls}`}
    >
      <span className="w-1 h-1 rounded-full bg-current" />
      {value}
    </span>
  )
}

function Section({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-md border border-border/40 bg-muted/20 px-2.5 py-2">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground/80 mb-1">
        <span className="w-3 h-3 inline-flex items-center justify-center text-muted-foreground/60">
          {icon}
        </span>
        {label}
      </div>
      <div className="text-xs text-foreground/85 leading-relaxed">{children}</div>
    </div>
  )
}

export function StockAiInsightCard({
  item,
  insight,
  loading,
  error,
  onGenerate,
  onClear,
  hasNews = true,
}: StockAiInsightCardProps): React.JSX.Element {
  // ─── Empty state ─────────────────────────────────────────────────────
  if (!insight && !loading && !error) {
    return (
      <div className="flex flex-col items-center justify-center gap-2.5 text-center px-5 py-8">
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
          <Sparkles size={16} className="text-primary/80" />
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">AI Insight</div>
          <div className="text-[11px] text-muted-foreground/80 mt-0.5 max-w-[260px]">
            {hasNews
              ? `Generate a quick analysis of why ${item.symbol} is moving, where it could go, and which partnerships matter.`
              : `No news yet for ${item.symbol}. Generate an analysis anyway — it'll lean on the latest quote and known context.`}
          </div>
        </div>
        <Button size="xs" variant="secondary" onClick={onGenerate} className="gap-1.5 mt-1">
          <Sparkles size={11} />
          Generate insight
        </Button>
      </div>
    )
  }

  // ─── Loading state ───────────────────────────────────────────────────
  if (loading && !insight) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-5 py-10 text-center">
        <AppLoaderGlyph size={18} />
        <div className="text-[11px] text-muted-foreground/80">
          Reading the tape for {item.symbol}…
        </div>
      </div>
    )
  }

  // ─── Error state (no prior insight) ──────────────────────────────────
  if (error && !insight) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-5 py-8 text-center">
        <div className="w-9 h-9 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle size={16} className="text-destructive/80" />
        </div>
        <div className="text-xs text-foreground/85 max-w-[280px]">{error}</div>
        <Button size="xs" variant="secondary" onClick={onGenerate} className="gap-1.5 mt-1">
          <RefreshCw size={11} />
          Try again
        </Button>
      </div>
    )
  }

  // ─── Populated state ─────────────────────────────────────────────────
  // (insight is guaranteed truthy here)
  if (!insight) return <div className="hidden" />

  const when = relativeTime(insight.generatedAt)
  const moveSign = insight.changePctAtGeneration > 0 ? '+' : ''

  return (
    <div className="flex flex-col gap-2 px-3 py-2.5">
      {/* Header */}
      <div className="flex items-center gap-1.5">
        <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Sparkles size={11} className="text-primary/80" />
        </div>
        <div className="text-[11px] font-semibold text-foreground">AI Insight</div>
        <ConfidenceChip value={insight.confidence} />
        <div className="ml-auto flex items-center gap-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={onGenerate}
            disabled={loading}
            className="gap-1 px-1.5"
            title="Regenerate"
          >
            <span className="w-3 h-3 inline-flex items-center justify-center">
              {loading ? <AppLoaderGlyph size={11} /> : <RefreshCw size={11} />}
            </span>
            <span className="text-[10px]">Regenerate</span>
          </Button>
          {onClear && (
            <Tooltip content="Clear insight" side="top">
              <Button
                variant="ghost"
                size="xs"
                onClick={onClear}
                className="px-1.5"
              >
                <X size={11} />
              </Button>
            </Tooltip>
          )}
        </div>
      </div>

      {/* Context strip */}
      <div className="text-[10px] text-muted-foreground/70 flex items-center gap-1.5 flex-wrap">
        <span>Generated {when}</span>
        <span>·</span>
        <span>at {insight.currency} {insight.priceAtGeneration.toFixed(2)}</span>
        <span>·</span>
        <span
          className={
            insight.changePctAtGeneration > 0
              ? 'text-emerald-500'
              : insight.changePctAtGeneration < 0
                ? 'text-rose-500'
                : 'text-muted-foreground/70'
          }
        >
          {moveSign}
          {insight.changePctAtGeneration.toFixed(2)}%
        </span>
        <span className="ml-auto opacity-60">{insight.model}</span>
      </div>

      {/* Summary headline */}
      <div className="text-sm font-medium text-foreground leading-snug pt-0.5">
        {insight.summary}
      </div>

      {/* Sections */}
      <div className="flex flex-col gap-1.5 mt-0.5">
        <Section icon={<Info size={11} />} label="Why it's moving">
          {insight.whyMoving}
        </Section>
        <Section icon={<TrendingUp size={11} />} label="Where it could go">
          {insight.prediction}
        </Section>
        <Section icon={<Handshake size={11} />} label="Partnerships & catalysts">
          {insight.partnerships}
        </Section>
        <Section icon={<AlertTriangle size={11} />} label="Risks to watch">
          {insight.risks}
        </Section>
      </div>

      {/* Stale-result banner when a regenerate failed */}
      {error && (
        <div className="mt-1 flex items-center gap-1.5 text-[10px] text-destructive/80 px-2 py-1 rounded border border-destructive/20 bg-destructive/5">
          <AlertTriangle size={10} />
          <span>Refresh failed: {error}</span>
        </div>
      )}

      {/* Disclaimer */}
      <div className="text-[9.5px] text-muted-foreground/60 leading-snug mt-1 pt-1.5 border-t border-border/30">
        AI-generated analysis. Educational only — not investment advice. May be inaccurate or out of date.
      </div>
    </div>
  )
}

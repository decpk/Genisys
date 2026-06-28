import { useEffect, useMemo, useState } from 'react'
import { LineChart, Newspaper, RefreshCw, Sparkles } from 'lucide-react'

import { AppLoaderGlyph } from '@/components/AppLoader'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useStocksTileStore } from '@/store/stocks-tile-store'

import { useStocksTileAiInsightData } from '../hooks/useStocksTileAiInsightData'
import { StockAiInsightCard } from '../StockAiInsightCard'
import { StockChart } from '../StockChart'
import { StockNewsDetail } from '../StockNewsDetail'
import { StockNewsList } from '../StockNewsList'
import { StockQuickStats } from '../StockQuickStats'
import { StockRangeToggle } from '../StockRangeToggle'

import type { StockDetailViewProps } from './StockDetailView.types'
import { useStockDetailViewData } from './useStockDetailViewData'

type StockDetailTab = 'chart' | 'news' | 'insight'

export function StockDetailView({
  item,
  quote,
  range,
  onRangeChange,
  historyByRange,
  news,
  loading,
  onRefresh,
}: StockDetailViewProps): React.JSX.Element {
  const points = historyByRange[range] ?? []
  useStockDetailViewData(item.symbol, range, points.length > 0)

  const [activeTab, setActiveTab] = useState<StockDetailTab>('chart')
  const [selectedNewsId, setSelectedNewsId] = useState<string | null>(null)

  // AI insight state — read from the store (one source of truth)
  const insight = useStocksTileStore((s) => s.aiInsightByItem[item.id] ?? null)
  const aiLoading = useStocksTileStore((s) => s.aiInsightLoadingByItem[item.id] ?? false)
  const aiError = useStocksTileStore((s) => s.aiInsightErrorByItem[item.id] ?? null)
  const { generateAiInsightFor, clearAiInsightFor } = useStocksTileAiInsightData()

  // Reset the in-panel news detail when switching symbols
  useEffect(() => {
    setSelectedNewsId(null)
    setActiveTab('chart')
  }, [item.id])

  // Drop stale selection if the news list no longer contains it
  useEffect(() => {
    if (selectedNewsId && !news.some((n) => n.id === selectedNewsId)) {
      setSelectedNewsId(null)
    }
  }, [news, selectedNewsId])

  const selectedNews = useMemo(
    () => (selectedNewsId ? news.find((n) => n.id === selectedNewsId) ?? null : null),
    [news, selectedNewsId],
  )

  return (
    <div className="flex flex-col gap-2 p-3 min-h-0 flex-1">
      <div className="flex items-end gap-2">
        <div className="flex-1 min-w-0">
          <StockQuickStats symbol={item.symbol} quote={quote} />
        </div>
        <Button variant="ghost" size="xs" onClick={onRefresh} disabled={loading}>
          <span className="w-3 h-3 flex items-center justify-center">
            {loading ? <AppLoaderGlyph size={12} /> : <RefreshCw size={12} />}
          </span>
        </Button>
      </div>
      <Tabs
        value={activeTab}
        onValueChange={(v) => setActiveTab(v as StockDetailTab)}
        className="flex-1 min-h-0"
      >
        <div className="flex items-center justify-between gap-2">
          <TabsList className="mx-0">
            <TabsTrigger value="chart" icon={<LineChart size={11} />}>
              Chart
            </TabsTrigger>
            <TabsTrigger value="news" icon={<Newspaper size={11} />}>
              News
              {news.length > 0 && (
                <span className="ml-1 inline-flex items-center justify-center min-w-[14px] h-[14px] px-1 rounded-full bg-primary/15 text-primary/80 text-[9px] font-semibold">
                  {news.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="insight" icon={<Sparkles size={11} />}>
              Insight
              {insight && (
                <span
                  className="ml-1 w-1.5 h-1.5 rounded-full bg-primary/70"
                  aria-label="Insight available"
                />
              )}
            </TabsTrigger>
          </TabsList>
          <div
            aria-hidden={activeTab !== 'chart'}
            className={
              activeTab === 'chart'
                ? 'opacity-100 pointer-events-auto transition-opacity duration-150'
                : 'opacity-0 pointer-events-none transition-opacity duration-150'
            }
          >
            <StockRangeToggle value={range} onChange={onRangeChange} />
          </div>
        </div>
        <TabsContent value="chart" className="mt-1.5">
          <StockChart
            symbol={item.symbol}
            points={points}
            loading={loading && points.length === 0}
            changePercent={quote?.changePct ?? null}
            currency={quote?.currency ?? null}
            range={range}
            height={220}
          />
        </TabsContent>
        <TabsContent value="news" className="mt-1.5 flex-1 min-h-0 flex flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto border border-border/30 rounded-md">
            {selectedNews ? (
              <StockNewsDetail
                item={selectedNews}
                onBack={() => setSelectedNewsId(null)}
              />
            ) : (
              <StockNewsList
                items={news}
                isLoading={loading && news.length === 0}
                onSelect={(n) => setSelectedNewsId(n.id)}
              />
            )}
          </div>
        </TabsContent>
        <TabsContent value="insight" className="mt-1.5 flex-1 min-h-0 flex flex-col">
          <div className="flex-1 min-h-0 overflow-y-auto border border-border/30 rounded-md">
            <StockAiInsightCard
              item={item}
              insight={insight}
              loading={aiLoading}
              error={aiError}
              hasNews={news.length > 0}
              onGenerate={() => {
                generateAiInsightFor(item.id).catch(() => {})
              }}
              onClear={insight ? () => clearAiInsightFor(item.id) : undefined}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

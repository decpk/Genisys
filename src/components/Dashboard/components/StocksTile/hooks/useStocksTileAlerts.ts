import { useEffect, useRef } from 'react'

import { notify } from '@/frameworks/notification'
import { useStocksTileStore } from '@/store/stocks-tile-store'

import { formatStockPrice } from '../utils/formatStockPrice'

type AlertSide = 'above' | 'below'

/**
 * Watches every item's latest quote and fires an OS-level notification
 * when the price crosses an `alertAbove` or `alertBelow` threshold.
 *
 * De-duplicates by tracking the last side that fired per-item: a fresh
 * cross in the opposite direction (or a return to no-alert) re-arms.
 */
export function useStocksTileAlerts(): void {
  const items = useStocksTileStore((s) => s.items)
  const quoteBySymbol = useStocksTileStore((s) => s.quoteBySymbol)
  const lastSideRef = useRef<Map<string, AlertSide | null>>(new Map())

  useEffect(() => {
    for (const item of items) {
      const quote = quoteBySymbol[item.symbol]
      if (!quote || quote.price === null) continue
      const price = quote.price

      let side: AlertSide | null = null
      if (item.alertAbove !== null && item.alertAbove !== undefined && price >= item.alertAbove) {
        side = 'above'
      } else if (
        item.alertBelow !== null &&
        item.alertBelow !== undefined &&
        price <= item.alertBelow
      ) {
        side = 'below'
      }

      const previous = lastSideRef.current.get(item.id) ?? null
      if (side && side !== previous) {
        const threshold = side === 'above' ? item.alertAbove : item.alertBelow
        notify({
          source: 'stocks',
          channel: 'os',
          type: 'warning',
          title: `${item.symbol} ${side === 'above' ? 'broke above' : 'fell below'} ${formatStockPrice(threshold ?? null, quote.currency)}`,
          message: `Now ${formatStockPrice(price, quote.currency)}`,
        })
      }
      lastSideRef.current.set(item.id, side)
    }
  }, [items, quoteBySymbol])
}

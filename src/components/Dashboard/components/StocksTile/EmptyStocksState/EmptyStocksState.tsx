import { Plus, TrendingUp } from 'lucide-react'

import { Button } from '@/components/ui/button'

export interface EmptyStocksStateProps {
  onAdd: () => void
}

export function EmptyStocksState({ onAdd }: EmptyStocksStateProps): React.JSX.Element {
  return (
    <div className="h-full flex flex-col items-center justify-center px-4 text-center">
      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
        <TrendingUp size={22} className="text-primary/60" />
      </div>
      <p className="text-sm font-medium text-foreground/80 mb-1">Your watchlist is empty</p>
      <p className="text-xs text-muted-foreground mb-3">
        Add a ticker (e.g. <span className="font-mono">AAPL</span>) to start tracking
        prices, charts, and headlines.
      </p>
      <Button onClick={onAdd} variant="link" size="xs">
        <Plus size={12} />
        Add your first ticker
      </Button>
    </div>
  )
}

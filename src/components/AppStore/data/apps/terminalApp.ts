import { Columns2, Plus, RotateCcw, SquareTerminal, TerminalSquare } from 'lucide-react'

import type { AppCatalogEntry } from '../../AppStore.types'

export const terminalApp: AppCatalogEntry = {
  id: 'terminal',
  name: 'Terminal',
  tagline: 'A real shell — with tabs and splits.',
  description:
    'Terminal is a fast, native shell that lives right inside Genisys, backed by a real PTY so colors, prompts, and interactive programs all behave exactly as they should. Open unlimited tabs, split any tab into resizable panes, and keep output cleanly isolated per tab. Close and reopen the app and your shells come back in their last working directories, so you never lose your place.',
  category: 'development',
  icon: SquareTerminal,
  accentColor: '#22C55E',
  features: [
    {
      icon: Plus,
      title: 'Unlimited tabs',
      description: 'Open as many shells as you need — each fully isolated.',
    },
    {
      icon: Columns2,
      title: 'Split panes',
      description: 'Split any tab horizontally or vertically and resize freely.',
    },
    {
      icon: TerminalSquare,
      title: 'Real PTY',
      description: 'Full TTY semantics — colors, interactive programs, the works.',
    },
    {
      icon: RotateCcw,
      title: 'Session restore',
      description: 'Reopen and your tabs return in their last directories.',
    },
  ],
  version: '1.0',
}

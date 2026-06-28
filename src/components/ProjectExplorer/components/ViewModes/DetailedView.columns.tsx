import type { ColumnDef } from '@tanstack/react-table'

import type { RepoItem } from '../../ProjectExplorer.types'
import { ExtPill } from './ExtPill'
import { formatAbsoluteDate, formatFileSize, formatSmartDate, getExtension } from './formatters'

function getName(item: RepoItem): string {
  return item.path.split('/').pop() ?? item.path
}

const ICON_COL: ColumnDef<RepoItem> = {
  id: 'icon',
  header: '',
  size: 28,
  minSize: 28,
  maxSize: 28,
  enableResizing: false
}

const NAME_COL: ColumnDef<RepoItem> = {
  id: 'name',
  accessorFn: (row) => getName(row),
  header: 'Name',
  size: 420,
  minSize: 120,
  maxSize: 800
}

const ACTIONS_COL: ColumnDef<RepoItem> = {
  id: 'actions',
  header: '',
  size: 32,
  minSize: 32,
  maxSize: 32,
  enableResizing: false
}

export const LOCAL_COLUMNS: ColumnDef<RepoItem>[] = [
  ICON_COL,
  NAME_COL,
  {
    id: 'size',
    accessorFn: (row) => (row.isFolder ? '—' : formatFileSize(row.size)),
    header: 'Size',
    size: 90,
    minSize: 60,
    maxSize: 200
  },
  {
    id: 'ext',
    accessorFn: (row) => {
      if (row.isFolder) return ''
      return getExtension(getName(row), false) ?? ''
    },
    header: 'Ext',
    size: 70,
    minSize: 50,
    maxSize: 150,
    cell: ({ row }) => {
      const ext = getExtension(getName(row.original), row.original.isFolder)
      if (!ext) return <span className="text-muted-foreground/60">—</span>
      return <ExtPill ext={ext} />
    }
  },
  {
    id: 'mode',
    accessorFn: (row) => row.mode ?? '',
    header: 'Mode',
    size: 80,
    minSize: 60,
    maxSize: 150,
    cell: ({ row }) => {
      const mode = row.original.mode
      if (!mode) return <span className="text-muted-foreground/60">—</span>
      return (
        <span className="inline-flex items-center rounded-sm bg-muted/60 px-1.5 py-0.5 text-[10px] text-muted-foreground">
          {mode}
        </span>
      );
    }
  },
  {
    id: 'modified',
    accessorFn: (row) => row.modifiedAt ?? '',
    header: 'Modified',
    size: 140,
    minSize: 100,
    maxSize: 300,
    cell: ({ row }) => {
      const iso = row.original.modifiedAt
      if (!iso) return <span className="text-muted-foreground/60">—</span>
      return (
        <span title={formatAbsoluteDate(iso)} className="text-muted-foreground">
          {formatSmartDate(iso)}
        </span>
      )
    }
  },
  ACTIONS_COL
]

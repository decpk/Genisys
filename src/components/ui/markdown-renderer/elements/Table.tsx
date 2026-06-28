interface MdTableProps {
  children?: React.ReactNode
  className?: string
}

export function MdTable({ children, className }: MdTableProps): React.JSX.Element {
  return (
    <div className="overflow-x-auto my-4 rounded-lg border border-border/50">
      <table className={`min-w-full border-collapse ${className}`}>{children}</table>
    </div>
  )
}

export function MdTableHeader({ children }: { children?: React.ReactNode }): React.JSX.Element {
  return (
    <th className="border-b border-border/50 px-3 py-2 bg-muted/40 text-xs font-medium text-left whitespace-nowrap align-bottom">
      {children}
    </th>
  )
}

export function MdTableCell({ children }: { children?: React.ReactNode }): React.JSX.Element {
  return (
    <td className="border-b border-border/30 px-3 py-2 text-xs align-top break-words">{children}</td>
  )
}

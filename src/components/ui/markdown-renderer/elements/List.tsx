interface MdListProps {
  children?: React.ReactNode
  className?: string
}

export function MdUnorderedList({ children, className }: MdListProps): React.JSX.Element {
  return <ul className={`list-disc pl-5 mb-3 space-y-1 ${className}`}>{children}</ul>
}

export function MdOrderedList({ children, className }: MdListProps): React.JSX.Element {
  return <ol className={`list-decimal pl-5 mb-3 space-y-1 ${className}`}>{children}</ol>
}

export function MdListItem({ children }: { children?: React.ReactNode }): React.JSX.Element {
  return <li className="leading-relaxed">{children}</li>
}

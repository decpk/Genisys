interface MdBlockquoteProps {
  children?: React.ReactNode
  className?: string
}

export function MdBlockquote({ children, className }: MdBlockquoteProps): React.JSX.Element {
  return (
    <blockquote className={`border-l-3 border-primary/30 pl-4 italic text-muted-foreground my-3 ${className}`}>
      {children}
    </blockquote>
  )
}

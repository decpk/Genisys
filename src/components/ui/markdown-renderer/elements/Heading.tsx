interface MdHeadingProps {
  children?: React.ReactNode
  className?: string
}

export function MdH1({ children, className }: MdHeadingProps): React.JSX.Element {
  return (
    <h1 className={`${className} font-bold mt-6 mb-3 text-foreground border-b border-border/40 pb-2`}>
      {children}
    </h1>
  )
}

export function MdH2({ children, className }: MdHeadingProps): React.JSX.Element {
  return (
    <h2 className={`${className} font-semibold mt-5 mb-2 text-foreground`}>{children}</h2>
  )
}

export function MdH3({ children, className }: MdHeadingProps): React.JSX.Element {
  return (
    <h3 className={`${className} font-semibold mt-4 mb-1.5 text-foreground`}>{children}</h3>
  )
}

export function MdH4({ children, className }: MdHeadingProps): React.JSX.Element {
  return (
    <h4 className={`${className} font-semibold mt-3 mb-1 text-foreground`}>{children}</h4>
  )
}

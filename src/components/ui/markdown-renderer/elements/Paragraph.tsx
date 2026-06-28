interface MdParagraphProps {
  children?: React.ReactNode
  className?: string
}

export function MdParagraph({ children, className }: MdParagraphProps): React.JSX.Element {
  return <p className={`mb-3 leading-relaxed ${className}`}>{children}</p>
}

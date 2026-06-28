interface MdLinkProps {
  href?: string
  children?: React.ReactNode
}

export function MdLink({ href, children }: MdLinkProps): React.JSX.Element {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline">
      {children}
    </a>
  )
}

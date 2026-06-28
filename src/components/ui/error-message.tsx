interface ErrorMessageProps {
  message: string
  variant?: 'inline' | 'card'
}

export function ErrorMessage({
  message,
  variant = 'inline'
}: ErrorMessageProps): React.JSX.Element {
  if (variant === 'card') {
    return (
      <div className="rounded-md border border-destructive/50 bg-destructive/5 p-4 text-sm text-destructive mt-4">
        {message}
      </div>
    )
  }

  return <div className="px-4 py-3 text-xs text-destructive bg-destructive/5">{message}</div>
}

interface ButtonGroupOption<T extends string | number> {
  value: T
  label: React.ReactNode
}

interface ButtonGroupProps<T extends string | number> {
  options: ButtonGroupOption<T>[]
  value: T
  onChange: (value: T) => void
  size?: 'sm' | 'default'
}

export function ButtonGroup<T extends string | number>({
  options,
  value,
  onChange,
  size = 'default',
}: ButtonGroupProps<T>): React.JSX.Element {
  return (
    <div className="inline-flex rounded-md border border-border overflow-hidden">
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`text-xs font-medium transition-colors cursor-pointer ${
            size === 'sm' ? 'px-2.5 py-1' : 'px-3 py-1.5'
          } ${
            value === opt.value
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}

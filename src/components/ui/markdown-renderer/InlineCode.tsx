import { memo, type ComponentPropsWithoutRef } from 'react'

export const InlineCode = memo(function InlineCode(
  props: ComponentPropsWithoutRef<'code'>
): React.JSX.Element {
  return (
    <code
      className="text-sm font-medium text-primary bg-primary/[0.06] px-1.5 py-0.5 my-0.5 inline-block rounded-md border border-primary/[0.08]"
      {...props}
    />
  )
})

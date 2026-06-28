'use client'

import * as React from 'react'
import { ContextMenu as ContextMenuPrimitive } from 'radix-ui'

import { cn } from '@/lib/utils'

function ContextMenu({ ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Root>) {
  return <ContextMenuPrimitive.Root data-slot="context-menu" {...props} />
}

function ContextMenuTrigger({
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Trigger>) {
  return <ContextMenuPrimitive.Trigger data-slot="context-menu-trigger" {...props} />
}

function ContextMenuContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Content>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.Content
        data-slot="context-menu-content"
        className={cn(
          'z-50 min-w-[180px] overflow-hidden rounded-lg border border-border/60 bg-popover/95 backdrop-blur-xl p-1 text-popover-foreground shadow-xl shadow-black/10 dark:shadow-black/30',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[98%] data-[state=open]:slide-in-from-top-1',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-[98%] data-[state=closed]:slide-out-to-top-1',
          className
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  )
}

function ContextMenuItem({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Item>) {
  return (
    <ContextMenuPrimitive.Item
      data-slot="context-menu-item"
      className={cn(
        'relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-[12px] outline-hidden transition-all duration-100',
        'text-foreground/80 hover:text-foreground',
        'focus:bg-primary/8 focus:text-foreground dark:focus:bg-primary/12',
        '[&_svg]:size-[14px] [&_svg]:shrink-0 [&_svg]:text-muted-foreground [&_svg]:transition-colors',
        'focus:[&_svg]:text-foreground',
        '[&_svg.text-destructive]:text-destructive focus:[&_svg.text-destructive]:text-destructive',
        // Destructive (delete) variant — unified styling for any item with `text-destructive` className.
        // Subtle red bg + red text/icon; slightly darker red bg on hover/focus.
        '[&.text-destructive]:bg-destructive/8 [&.text-destructive]:text-destructive',
        '[&.text-destructive]:hover:bg-destructive/15 [&.text-destructive]:hover:text-destructive',
        '[&.text-destructive]:focus:bg-destructive/15 [&.text-destructive]:focus:text-destructive',
        '[&.text-destructive_svg]:text-destructive',
        'data-[disabled]:pointer-events-none data-[disabled]:opacity-40',
        className
      )}
      {...props}
    />
  )
}

function ContextMenuSeparator({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.Separator>) {
  return (
    <ContextMenuPrimitive.Separator
      data-slot="context-menu-separator"
      className={cn('-mx-1 my-1 h-px bg-border/60', className)}
      {...props}
    />
  )
}

function ContextMenuLabel({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="context-menu-label"
      className={cn('px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60', className)}
      {...props}
    />
  )
}

function ContextMenuSub({ ...props }: React.ComponentProps<typeof ContextMenuPrimitive.Sub>) {
  return <ContextMenuPrimitive.Sub data-slot="context-menu-sub" {...props} />
}

function ContextMenuSubTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubTrigger>) {
  return (
    <ContextMenuPrimitive.SubTrigger
      data-slot="context-menu-sub-trigger"
      className={cn(
        'relative flex cursor-pointer select-none items-center gap-2 rounded-md px-2 py-1.5 text-[12px] outline-hidden transition-all duration-100',
        'text-foreground/80 hover:text-foreground',
        'focus:bg-primary/8 focus:text-foreground dark:focus:bg-primary/12',
        '[&_svg]:size-[14px] [&_svg]:shrink-0 [&_svg]:text-muted-foreground [&_svg]:transition-colors',
        'focus:[&_svg]:text-foreground',
        className
      )}
      {...props}
    >
      {children}
      <svg className="ml-auto size-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
    </ContextMenuPrimitive.SubTrigger>
  )
}

function ContextMenuSubContent({
  className,
  ...props
}: React.ComponentProps<typeof ContextMenuPrimitive.SubContent>) {
  return (
    <ContextMenuPrimitive.Portal>
      <ContextMenuPrimitive.SubContent
        data-slot="context-menu-sub-content"
        className={cn(
          'z-50 min-w-[160px] overflow-hidden rounded-lg border border-border/60 bg-popover/95 backdrop-blur-xl p-1 text-popover-foreground shadow-xl shadow-black/10 dark:shadow-black/30',
          'data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[98%]',
          'data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-[98%]',
          className
        )}
        {...props}
      />
    </ContextMenuPrimitive.Portal>
  )
}

function ContextMenuShortcut({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="context-menu-shortcut"
      className={cn(
        'ml-auto pl-4 text-[11px] tracking-wider text-muted-foreground/70',
        className
      )}
      {...props}
    />
  )
}

export {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
  ContextMenuShortcut,
}

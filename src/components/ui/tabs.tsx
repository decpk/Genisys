import * as React from 'react'
import { cn } from '@/lib/utils'
import { Tooltip } from '@/components/Tooltip'

interface TabsContextValue {
  value: string
  onValueChange: (value: string) => void
  registerTab: (value: string, el: HTMLButtonElement | null) => void
  listRef: React.RefObject<HTMLDivElement | null>
  iconsOnly: boolean
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function useTabs() {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error('Tabs components must be used within <Tabs>')
  return ctx
}

function Tabs({
  value,
  onValueChange,
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & {
  value: string
  onValueChange: (value: string) => void
}) {
  const tabRefs = React.useRef<Map<string, HTMLButtonElement>>(new Map())
  const listRef = React.useRef<HTMLDivElement | null>(null)
  const [iconsOnly, setIconsOnly] = React.useState(false)

  const registerTab = React.useCallback((val: string, el: HTMLButtonElement | null) => {
    if (el) tabRefs.current.set(val, el)
    else tabRefs.current.delete(val)
  }, [])

  return (
    <TabsContext.Provider value={{ value, onValueChange, registerTab, listRef, iconsOnly: iconsOnly }}>
      <IconsOnlyDetector listRef={listRef} onToggle={setIconsOnly} iconsOnly={iconsOnly}>
        <div data-slot="tabs" className={cn('flex flex-col', className)} {...props}>
          {children}
        </div>
      </IconsOnlyDetector>
    </TabsContext.Provider>
  )
}

/**
 * Detects whether the TabsList overflows and toggles iconsOnly mode.
 * Uses a hidden measurement div that always renders full labels to avoid oscillation.
 */
function IconsOnlyDetector({
  listRef,
  onToggle,
  iconsOnly,
  children,
}: {
  listRef: React.RefObject<HTMLDivElement | null>
  onToggle: (v: boolean) => void
  iconsOnly: boolean
  children: React.ReactNode
}) {
  const collapseWidth = React.useRef<number | null>(null)
  const BUFFER = 20

  React.useLayoutEffect(() => {
    const list = listRef.current
    if (!list) return

    const check = () => {
      const container = list.parentElement ?? list
      const availableWidth = container.clientWidth

      if (!iconsOnly) {
        // Currently showing labels — check if tabs overflow
        if (list.scrollWidth > availableWidth) {
          collapseWidth.current = availableWidth
          onToggle(true)
        }
      } else {
        // Currently icon-only — expand back only if width exceeds collapse threshold + buffer
        if (collapseWidth.current !== null && availableWidth > collapseWidth.current + BUFFER) {
          collapseWidth.current = null
          onToggle(false)
        }
      }
    }

    // Synchronous check before first paint to avoid overflow flash
    check()

    const observer = new ResizeObserver(check)
    observer.observe(list.parentElement ?? list)
    // Also re-check when list itself changes (e.g. tabs added/removed)
    observer.observe(list)

    return () => observer.disconnect()
  }, [listRef, iconsOnly, onToggle])

  return <>{children}</>
}

function TabsList({ className, children, ...props }: React.ComponentProps<'div'>) {
  const { value, listRef, iconsOnly } = useTabs()
  const [indicator, setIndicator] = React.useState({ left: 0, top: 0, width: 0, height: 0, opacity: 0 })

  const updateIndicator = React.useCallback(() => {
    const list = listRef.current;
    if (!list) return;

    const activeBtn = list.querySelector<HTMLButtonElement>(
      '[data-state="active"]',
    );
    if (!activeBtn) return;

    const listRect = list.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();

    setIndicator({
      left: btnRect.left - listRect.left + list.scrollLeft,
      top: btnRect.top - listRect.top,
      width: btnRect.width,
      height: btnRect.height,
      opacity: 1,
    });
  }, [listRef]);

  React.useLayoutEffect(() => {
    updateIndicator();
  }, [value, iconsOnly, updateIndicator]);

  React.useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    const observer = new ResizeObserver(updateIndicator);
    observer.observe(list);
    return () => observer.disconnect();
  }, [listRef, updateIndicator]);

  return (
    <div
      data-slot="tabs-list"
      ref={listRef}
      className={cn(
        "relative inline-flex items-center overflow-hidden rounded-full p-0.75 gap-0.5 h-fit w-fit mx-auto my-1 text-muted-foreground bg-muted/90",
        className,
      )}
      {...props}
    >
      {children}
      <span
        className="absolute bg-primary/10 rounded-full shadow-sm transition-all duration-300 ease-out"
        style={{
          left: indicator.left,
          top: indicator.top,
          width: indicator.width,
          height: indicator.height,
          opacity: indicator.opacity,
        }}
      />
    </div>
  );
}

function TabsTrigger({
  value,
  className,
  icon,
  children,
  ...props
}: React.ComponentProps<'button'> & { value: string; icon?: React.ReactNode }) {
  const { value: selectedValue, onValueChange, registerTab, iconsOnly } = useTabs()
  const isActive = selectedValue === value

  const ref = React.useCallback(
    (el: HTMLButtonElement | null) => {
      registerTab(value, el)
    },
    [registerTab, value]
  )

  const showIconOnly = iconsOnly && !!icon

  const paddingClass = showIconOnly ? 'px-3.5' : 'px-3'
  const gapClass = icon && !showIconOnly ? 'gap-1.5' : ''

  const button = (
    <button
      ref={ref}
      data-slot="tabs-trigger"
      data-state={isActive ? 'active' : 'inactive'}
      onClick={() => onValueChange(value)}
      className={cn(
        'relative inline-flex items-center justify-center whitespace-nowrap text-xs font-medium transition-colors duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
        'z-10 rounded-full py-1.5',
        isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground',
        paddingClass,
        gapClass,
        className
      )}
      {...props}
    >
      {icon}
      {!showIconOnly && children}
    </button>
  )

  return (
    <Tooltip content={showIconOnly ? children : null} side="bottom">
      {button}
    </Tooltip>
  )
}

function TabsContent({
  value,
  className,
  ...props
}: React.ComponentProps<'div'> & { value: string }) {
  const { value: selectedValue } = useTabs()
  if (selectedValue !== value) return null

  return (
    <div
      data-slot="tabs-content"
      className={cn('mt-2 focus-visible:outline-none animate-in fade-in-0 duration-200', className)}
      {...props}
    />
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }

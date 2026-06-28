export const ONBOARDING_STYLES = {
  overlay: 'fixed inset-0 z-[9998] bg-background overflow-hidden',
  container: 'relative w-full h-full flex flex-col',
  stepArea: 'flex-1 flex items-start justify-center overflow-y-auto overflow-x-hidden px-8 py-8',
  navBar: 'flex items-center justify-center gap-4 py-6 shrink-0',
  indicatorArea: 'flex justify-center pb-6 shrink-0',
  fadeIn: {
    opacity: 1,
    transition: 'opacity 0.6s ease-out',
  },
  fadeOut: {
    opacity: 0,
    transition: 'opacity 0.6s ease-out',
  },
} as const

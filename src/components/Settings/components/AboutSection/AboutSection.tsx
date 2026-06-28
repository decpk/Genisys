import { memo, useState, useEffect } from 'react'
import { GenisysIconReveal } from '@/components/GenisysIconReveal'
import { Code2, Hexagon, Terminal, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSettingsStore } from '@/store/settings-store'
import creatorPhoto from '@/assets/creator-praveen.jpg'

const SERIF_STYLE = { fontFamily: 'Georgia, "Times New Roman", serif' } as const

const MOUNTED_STYLE = {
  opacity: 1,
  transform: 'translateY(0)',
  transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
} as const

const UNMOUNTED_STYLE = {
  opacity: 0,
  transform: 'translateY(12px)',
  transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
} as const

export const AboutSection = memo(function AboutSection(): React.JSX.Element {
  const [mounted, setMounted] = useState(false)
  const setHasCompletedOnboarding = useSettingsStore((s) => s.setHasCompletedOnboarding)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="relative flex flex-col items-center pt-16 min-h-screen overflow-hidden select-none">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-primary/[0.04] blur-3xl animate-breathe" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-primary/[0.03] blur-3xl animate-breathe [animation-delay:1s]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.02] blur-3xl" />

        {/* Floating grid dots */}
        <svg
          className="absolute inset-0 w-full h-full opacity-[0.03]"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern
              id="about-grid"
              width="32"
              height="32"
              patternUnits="userSpaceOnUse"
            >
              <circle cx="16" cy="16" r="1" fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#about-grid)" />
        </svg>

        {/* Decorative floating icons */}
        <Hexagon
          size={20}
          className="absolute top-[15%] left-[18%] text-primary/10 animate-breathe [animation-delay:0.5s]"
          strokeWidth={1}
        />
        <Code2
          size={16}
          className="absolute top-[22%] right-[22%] text-primary/10 animate-breathe [animation-delay:1.2s]"
          strokeWidth={1}
        />
        <Terminal
          size={14}
          className="absolute bottom-[25%] left-[25%] text-primary/10 animate-breathe [animation-delay:0.8s]"
          strokeWidth={1}
        />
        <Hexagon
          size={12}
          className="absolute bottom-[20%] right-[20%] text-primary/10 animate-breathe [animation-delay:1.5s]"
          strokeWidth={1}
        />
      </div>

      {/* Main content */}
      <div
        className="relative z-10 flex flex-col items-center gap-8"
        style={mounted ? MOUNTED_STYLE : UNMOUNTED_STYLE}
      >
        {/* App icon with glow */}
        <div className="relative group">
          {/* Glow rings */}
          <div className="absolute inset-0 rounded-3xl bg-primary/20 blur-xl scale-110 animate-breathe" />
          <div className="absolute inset-0 rounded-3xl bg-primary/10 blur-2xl scale-125" />

          {/* Icon container */}
          <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center backdrop-blur-sm shadow-lg shadow-primary/5 transition-transform duration-500 group-hover:scale-105">
            <GenisysIconReveal size={52} className="text-primary" />
          </div>
        </div>

        {/* App name & version */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Dev
            <span className="text-primary">OS</span>
          </h2>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/15">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-breathe" />
            <span className="text-xs font-medium text-primary">
              v{__APP_VERSION__}
            </span>
          </div>
        </div>

        {/* Tagline */}
        <p className="text-sm text-muted-foreground/80 max-w-xs text-center leading-relaxed">
          A developer operating system — review, explore, and ship with
          confidence.
        </p>

        {/* Divider */}
        <div className="flex items-center gap-4 w-48">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-border" />
          <Hexagon
            size={10}
            className="text-muted-foreground/30"
            strokeWidth={1.5}
          />
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-border" />
        </div>

        {/* Developer card */}
        <div className="flex flex-col items-center gap-4">
          <p
            className="text-sm tracking-[0.25em] uppercase text-muted-foreground/60"
            style={SERIF_STYLE}
          >
            Crafted by
          </p>

          <img
            src={creatorPhoto}
            alt="Praveen Kumar"
            draggable={false}
            className="w-28 aspect-[1516/2060] rounded-2xl object-cover border border-border shadow-sm"
          />

          <div className="flex flex-col items-center gap-1.5">
            <p
              className="text-2xl font-bold text-foreground tracking-wide"
              style={SERIF_STYLE}
            >
              Praveen Kumar
            </p>
          </div>
        </div>

        {/* Show Onboarding */}
        <div className="flex items-center gap-4 w-48">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-border" />
          <Hexagon
            size={10}
            className="text-muted-foreground/30"
            strokeWidth={1.5}
          />
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-border" />
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setHasCompletedOnboarding(false)}
          className="inline-flex items-center gap-2 rounded-full hover:border-primary/30 hover:shadow-sm hover:shadow-primary/5 active:scale-95"
        >
          <RotateCcw size={12} className="opacity-50" />
          Show Welcome Screen
        </Button>
      </div>
    </div>
  );
})

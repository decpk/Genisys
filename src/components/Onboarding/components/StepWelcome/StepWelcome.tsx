import { useState, useEffect } from 'react'

import { GenisysIcon } from '@/components/GenisysIcon'

export function StepWelcome(): React.JSX.Element {
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 100)
    const t2 = setTimeout(() => setStage(2), 350)
    const t3 = setTimeout(() => setStage(3), 600)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  return (
    <div className="relative flex flex-col items-center justify-center text-center overflow-hidden py-8">
      {/* ── Atmospheric spotlights ── */}
      <div
        className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full opacity-[0.12]"
        style={{
          background:
            "radial-gradient(ellipse at center, hsl(var(--primary)) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 right-[10%] w-[400px] h-[350px] rounded-full opacity-[0.06]"
        style={{
          background:
            "radial-gradient(ellipse at center, hsl(var(--primary)) 0%, transparent 70%)",
        }}
      />
      {/* Subtle dot grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* ── Icon with concentric glow rings ── */}
      <div
        className="relative mb-14 transition-all duration-700 ease-out"
        style={{
          opacity: stage >= 1 ? 1 : 0,
          transform:
            stage >= 1
              ? "translateY(0) scale(1)"
              : "translateY(24px) scale(0.9)",
        }}
      >
        {/* Outer bloom */}
        <div
          className="absolute inset-0 rounded-full blur-[60px] scale-[3] animate-pulse"
          style={{ background: "hsl(var(--primary) / 0.15)" }}
        />
        {/* Middle ring */}
        <div
          className="absolute -inset-5 rounded-full border border-primary/10"
          style={{
            animation: "onb-ring-pulse 3s ease-in-out infinite",
          }}
        />
        {/* Inner ring */}
        <div
          className="absolute -inset-2.5 rounded-full border border-primary/20"
          style={{
            animation: "onb-ring-pulse 3s ease-in-out infinite 0.5s",
          }}
        />
        {/* Icon container */}
        <div
          className="relative w-32 h-32 rounded-[28px] flex items-center justify-center border border-primary/25"
          style={{
            background:
              "linear-gradient(145deg, hsl(var(--primary) / 0.14), hsl(var(--primary) / 0.04))",
            boxShadow:
              "0 0 40px hsl(var(--primary) / 0.12), inset 0 1px 0 hsl(var(--primary) / 0.15)",
          }}
        >
          <GenisysIcon size={64} className="text-primary drop-shadow-lg" />
        </div>
      </div>

      {/* ── Title ── */}
      <h1
        className="text-7xl font-extrabold tracking-tighter transition-all duration-700 ease-out"
        style={{
          opacity: stage >= 2 ? 1 : 0,
          transform: stage >= 2 ? "translateY(0)" : "translateY(20px)",
        }}
      >
        <span className="text-foreground">Welcome to Genisys</span>
      </h1>

      {/* ── Subtitle ── */}
      <p
        className="text-lg text-muted-foreground/50 mt-6 max-w-md font-light leading-relaxed tracking-wide transition-all duration-700 ease-out"
        style={{
          opacity: stage >= 3 ? 1 : 0,
          transform: stage >= 3 ? "translateY(0)" : "translateY(16px)",
        }}
      >
        Your developer operating system.
        <br />
        Let&apos;s get you set up in a few quick steps.
      </p>

      {/* Keyframe injection */}
      <style>{`
        @keyframes onb-ring-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.08); }
        }
      `}</style>
    </div>
  );
}

import { useState } from 'react'
import {
  ChevronDown,
  ChevronRight,
  Trophy,
  Swords,
} from 'lucide-react'
import ReactMarkdown, { type Components } from 'react-markdown'

import type { ChallengeItem, ChallengeTier } from './quiz-parser'
import { libraryRemarkPlugins, libraryRehypePlugins, libraryUrlTransform } from './markdown-plugins'

/* ── Tier config ── */

const TIER_CONFIG: Record<
  ChallengeTier,
  { emoji: string; label: string; color: string; bg: string; border: string }
> = {
  easy: {
    emoji: '🟢',
    label: 'Easy',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/[0.06]',
    border: 'border-emerald-500/20',
  },
  medium: {
    emoji: '🟡',
    label: 'Medium',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/[0.06]',
    border: 'border-amber-500/20',
  },
  hard: {
    emoji: '🔴',
    label: 'Hard',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-500/[0.06]',
    border: 'border-red-500/20',
  },
  boss: {
    emoji: '💀',
    label: 'Boss',
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-500/[0.06]',
    border: 'border-purple-500/20',
  },
}

/* ── Lightweight markdown components for challenge text ── */

const challengeMdComponents: Components = {
  code: ({ children, className }) => {
    const match = /language-(\w+)/.exec(className || '')
    const content = String(children).replace(/\n$/, '')
    const isBlock = match || content.includes('\n')

    if (!isBlock) {
      return (
        <code className="text-[13px] font-medium text-primary bg-primary/[0.06] px-1.5 py-0.5 rounded-md border border-primary/[0.08]">
          {children}
        </code>
      )
    }

    const lang = match?.[1] ?? 'text'
    return (
      <div className="my-3 rounded-lg border border-border/50 bg-muted/30 overflow-hidden">
        <div className="flex items-center px-3 py-1.5 border-b border-border/30 bg-muted/40">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground/60">
            {lang}
          </span>
        </div>
        <pre className="overflow-x-auto p-3 !m-0 !bg-transparent">
          <code className="text-[13px] leading-6">{content}</code>
        </pre>
      </div>
    );
  },

  p: ({ children }) => (
    <p className="text-[14px] leading-[1.75] text-foreground/80 my-2 first:mt-0 last:mb-0">
      {children}
    </p>
  ),

  strong: ({ children }) => (
    <strong className="font-semibold text-foreground">{children}</strong>
  ),

  ul: ({ children }) => (
    <ul className="my-2 space-y-1 pl-1 list-none">{children}</ul>
  ),

  li: ({ children }) => (
    <li className="flex gap-2 text-[14px] leading-[1.75] text-foreground/80">
      <span className="text-primary/40 shrink-0 mt-[2px] select-none">•</span>
      <span className="flex-1">{children}</span>
    </li>
  ),

  blockquote: ({ children }) => (
    <div className="my-3 flex gap-3 rounded-lg bg-emerald-500/[0.05] border border-emerald-500/15 px-3 py-2">
      <span className="text-emerald-500 shrink-0 mt-0.5 text-xs">💡</span>
      <blockquote className="!border-0 !p-0 !m-0 flex-1 text-[13px] text-foreground/70 [&>p]:!m-0 [&>p]:leading-6">
        {children}
      </blockquote>
    </div>
  ),

  pre: ({ children }) => <>{children}</>,
}

/* ── Single Challenge Card ── */

function ChallengeCard({ challenge }: { challenge: ChallengeItem }) {
  const [showSolution, setShowSolution] = useState(false)
  const tier = TIER_CONFIG[challenge.tier]

  return (
    <div className={`rounded-xl border ${tier.border} ${tier.bg} overflow-hidden`}>
      {/* Header */}
      <div className="px-5 py-3.5 flex items-center gap-3">
        <span className="text-lg leading-none">{tier.emoji}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-wider ${tier.color}`}
            >
              {tier.label}
            </span>
          </div>
          <h4 className="text-[15px] font-semibold text-foreground mt-0.5 truncate">
            {challenge.title}
          </h4>
        </div>
      </div>

      {/* Body */}
      {challenge.bodyMarkdown && (
        <div className="px-5 pb-4 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
          <ReactMarkdown
            remarkPlugins={libraryRemarkPlugins}
            rehypePlugins={libraryRehypePlugins}
            urlTransform={libraryUrlTransform}
            components={challengeMdComponents}
          >
            {challenge.bodyMarkdown}
          </ReactMarkdown>
        </div>
      )}

      {/* Solution toggle */}
      {challenge.solutionMarkdown && (
        <div className="border-t border-border/20">
          <button
            onClick={() => setShowSolution(!showSolution)}
            className="w-full flex items-center gap-2 px-5 py-2.5 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            {showSolution ? (
              <ChevronDown size={14} />
            ) : (
              <ChevronRight size={14} />
            )}
            {showSolution ? 'Hide Solution' : 'Show Solution'}
          </button>
          {showSolution && (
            <div className="px-5 pb-4 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
              <ReactMarkdown
                remarkPlugins={libraryRemarkPlugins}
                rehypePlugins={libraryRehypePlugins}
                urlTransform={libraryUrlTransform}
                components={challengeMdComponents}
              >
                {challenge.solutionMarkdown}
              </ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Challenge Section ── */

interface ChallengeSectionProps {
  challenges: ChallengeItem[]
}

export function ChallengeSection({ challenges }: ChallengeSectionProps) {
  return (
    <div className="my-8">
      {/* Section header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/15 flex items-center justify-center">
          <Swords size={16} className="text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground tracking-tight">
            Challenge
          </h2>
          <p className="text-[12px] text-muted-foreground/60">
            Test your skills with these coding challenges
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <Trophy size={14} className="text-amber-500/60" />
          <span className="text-[11px] text-muted-foreground/50 font-medium">
            {challenges.length} challenge{challenges.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Challenge cards */}
      <div className="space-y-4">
        {challenges.map((challenge, i) => (
          <ChallengeCard key={i} challenge={challenge} />
        ))}
      </div>
    </div>
  )
}

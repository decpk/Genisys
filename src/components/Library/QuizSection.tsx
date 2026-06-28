import { useState } from 'react'
import {
  Circle,
  CircleDot,
  CircleCheck,
  CircleX,
  Eye,
} from 'lucide-react'
import ReactMarkdown, { type Components } from 'react-markdown'

import { Button } from '@/components/ui/button'
import type { QuizQuestion } from './quiz-parser'
import { libraryRemarkPlugins, libraryRehypePlugins, libraryUrlTransform } from './markdown-plugins'
import { slugify } from './chapter-highlights'

/* ── Lightweight markdown components for quiz question text ── */

const quizMdComponents: Components = {
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

  pre: ({ children }) => <>{children}</>,
}

/* ── Question Card ── */

interface QuizQuestionCardProps {
  question: QuizQuestion
  index: number
}

function QuizQuestionCard({ question, index }: QuizQuestionCardProps) {
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set())
  const [isAnswered, setIsAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const correctIndices = new Set(
    question.options
      .map((o, i) => (o.isCorrect ? i : -1))
      .filter((i) => i >= 0)
  )

  const checkAnswer = (selected: Set<number>) => {
    const correct =
      selected.size === correctIndices.size &&
      [...selected].every((i) => correctIndices.has(i))
    setIsCorrect(correct)
    setIsAnswered(true)
  }

  const handleOptionClick = (optIndex: number) => {
    if (isAnswered) return

    if (question.isMultiSelect) {
      setSelectedIndices((prev) => {
        const next = new Set(prev)
        if (next.has(optIndex)) next.delete(optIndex)
        else next.add(optIndex)
        return next
      })
    } else {
      const selected = new Set([optIndex])
      setSelectedIndices(selected)
      checkAnswer(selected)
    }
  }

  const getOptionStyle = (optIndex: number) => {
    const isSelected = selectedIndices.has(optIndex)
    const isOptionCorrect = question.options[optIndex]?.isCorrect

    if (!isAnswered) {
      if (isSelected) {
        return 'border-primary/50 bg-primary/[0.04] ring-1 ring-primary/20'
      }
      return 'border-border/40 bg-background hover:border-primary/30 hover:bg-primary/[0.02]'
    }

    // Answered states
    if (isSelected && isOptionCorrect) {
      return 'border-emerald-500/50 bg-emerald-500/[0.06]'
    }
    if (isSelected && !isOptionCorrect) {
      return 'border-red-500/50 bg-red-500/[0.06]'
    }
    if (!isSelected && isOptionCorrect) {
      return 'border-emerald-500/40 bg-emerald-500/[0.04]'
    }
    return 'border-border/20 bg-muted/20 opacity-60'
  }

  const getOptionIcon = (optIndex: number) => {
    const isSelected = selectedIndices.has(optIndex)
    const isOptionCorrect = question.options[optIndex]?.isCorrect

    if (!isAnswered) {
      if (isSelected) return <CircleDot size={16} className="text-primary" />
      return <Circle size={16} className="text-muted-foreground/40" />
    }

    if (isSelected && isOptionCorrect) {
      return <CircleCheck size={16} className="text-emerald-500" />
    }
    if (isSelected && !isOptionCorrect) {
      return <CircleX size={16} className="text-red-500" />
    }
    if (!isSelected && isOptionCorrect) {
      return <CircleCheck size={16} className="text-emerald-500/60" />
    }
    return <Circle size={16} className="text-muted-foreground/20" />
  }

  const hasOptions = question.options.length > 0

  return (
    <div className="rounded-xl border border-border/40 bg-background overflow-hidden">
      {/* Question text */}
      <div className="px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="shrink-0 mt-0.5 w-6 h-6 rounded-full bg-primary/[0.07] border border-primary/10 flex items-center justify-center text-[11px] font-semibold text-primary/70">
            {index + 1}
          </span>
          <div className="flex-1 [&>p:first-child]:mt-0 [&>p:last-child]:mb-0">
            <ReactMarkdown
              remarkPlugins={libraryRemarkPlugins}
              rehypePlugins={libraryRehypePlugins}
              urlTransform={libraryUrlTransform}
              components={quizMdComponents}
            >
              {question.questionMarkdown}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      {/* Options */}
      {hasOptions && (
        <div className="px-5 pb-4 space-y-2">
          {question.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleOptionClick(i)}
              disabled={isAnswered}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg border text-left transition-all duration-150 ${
                isAnswered ? '' : 'cursor-pointer'
              } ${getOptionStyle(i)}`}
            >
              {getOptionIcon(i)}
              <span className="text-[13px] leading-relaxed text-foreground/80">
                {opt.label}
              </span>
            </button>
          ))}

          {/* Multi-select submit button */}
          {question.isMultiSelect && !isAnswered && selectedIndices.size > 0 && (
            <Button
              variant="default"
              size="sm"
              onClick={() => checkAnswer(selectedIndices)}
              className="mt-2"
            >
              Check Answer
            </Button>
          )}
        </div>
      )}

      {/* Reveal button for open-ended questions */}
      {!hasOptions && !isAnswered && (
        <div className="px-5 pb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAnswered(true)}
          >
            <Eye size={14} />
            Reveal Answer
          </Button>
        </div>
      )}

      {/* Answer + Explanation (shown after answering) */}
      {isAnswered && (question.answer || question.explanation) && (
        <div
          className={`px-5 py-4 border-t ${
            hasOptions
              ? isCorrect
                ? 'border-emerald-500/20 bg-emerald-500/[0.03]'
                : 'border-amber-500/20 bg-amber-500/[0.03]'
              : 'border-primary/10 bg-primary/[0.02]'
          }`}
        >
          {hasOptions && (
            <div
              className={`flex items-center gap-2 mb-2 text-[13px] font-medium ${
                isCorrect
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {isCorrect ? (
                <>
                  <CircleCheck size={14} />
                  Correct!
                </>
              ) : (
                <>
                  <CircleX size={14} />
                  Incorrect
                </>
              )}
            </div>
          )}
          {question.answer && (
            <p className="text-[13px] leading-relaxed text-foreground/80">
              <span className="font-semibold text-foreground">Answer: </span>
              {question.answer}
            </p>
          )}
          {question.explanation && (
            <p className="text-[13px] leading-relaxed text-foreground/70 mt-1.5">
              <span className="font-semibold text-foreground/80">
                Explanation:{' '}
              </span>
              {question.explanation}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Quiz Section ── */

interface QuizSectionProps {
  title: string
  questions: QuizQuestion[]
}

export function QuizSection({ title, questions }: QuizSectionProps) {
  const id = `highlight-section-${slugify(title)}`

  return (
    <div className="my-7">
      <h2
        id={id}
        className="text-xl font-semibold tracking-tight text-foreground mt-10 mb-4 pb-2 border-b border-border/30 first:mt-0 scroll-mt-20"
      >
        {title}
      </h2>
      <div className="space-y-4">
        {questions.map((q, i) => (
          <QuizQuestionCard key={i} question={q} index={i} />
        ))}
      </div>
    </div>
  )
}

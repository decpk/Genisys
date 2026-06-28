import { useState, useCallback, memo, useMemo } from 'react'
import {
  Check,
  ChevronRight,
  CircleDot,
  Square,
  CheckSquare,
  Terminal,
  X,
} from 'lucide-react'
import { AppLoaderGlyph } from '@/components/AppLoader'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { shouldAutoExecute, getFunctionMeta } from '../../utils/functionRegistry'
import { formatArgs } from '../ToolCallBlock/ToolCallBlock.constants'
import { Stepper } from './Stepper'
import { WizardFooter } from './WizardFooter'
import type {
  AIQuestion,
  AIQuestionAnswer,
  AIQuestionBlockProps,
} from './AIQuestionBlock.types'

// ── Main Component ─────────────────────────────────────────────────

export const AIQuestionBlock = memo(function AIQuestionBlock({
  questions,
  isAnswered,
  onSubmitAnswers,
  onExecuteFunction,
}: AIQuestionBlockProps): React.JSX.Element {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Map<string, AIQuestionAnswer>>(new Map())
  const [submitted, setSubmitted] = useState(isAnswered)
  const [executingFn, setExecutingFn] = useState<string | null>(null)
  const [fnResults, setFnResults] = useState<Map<string, string>>(new Map())

  const currentQuestion = questions[currentStep]
  const isLastStep = currentStep === questions.length - 1
  const hasCurrentAnswer = answers.has(currentQuestion?.id)

  const setAnswer = useCallback((questionId: string, answer: AIQuestionAnswer['answer']) => {
    setAnswers((prev) => {
      const next = new Map(prev)
      next.set(questionId, { questionId, answer })
      return next
    })
  }, [])

  const handleNext = useCallback(() => {
    if (isLastStep) {
      // Submit all
      const allAnswers = Array.from(answers.values())
      setSubmitted(true)
      onSubmitAnswers(allAnswers, questions)
    } else {
      setCurrentStep((s) => s + 1)
    }
  }, [isLastStep, answers, onSubmitAnswers, questions])

  const handleConfirm = useCallback(
    (value: boolean) => {
      setAnswer(currentQuestion.id, value)
      // Auto-advance for confirm
      if (isLastStep) {
        const allAnswers = Array.from(
          new Map(answers).set(currentQuestion.id, { questionId: currentQuestion.id, answer: value }).values(),
        )
        setSubmitted(true)
        onSubmitAnswers(allAnswers, questions)
      } else {
        setCurrentStep((s) => s + 1)
      }
    },
    [currentQuestion, isLastStep, answers, onSubmitAnswers, questions, setAnswer],
  )

  const handleFunctionExecute = useCallback(
    async (question: AIQuestion, approved: boolean) => {
      if (!question.functionCall) return

      setAnswer(question.id, approved)

      if (approved && onExecuteFunction) {
        setExecutingFn(question.id)
        try {
          const result = await onExecuteFunction(question.functionCall.name, question.functionCall.args)
          setFnResults((prev) => new Map(prev).set(question.id, result))
        } catch (err) {
          setFnResults((prev) => new Map(prev).set(question.id, `Error: ${err}`))
        } finally {
          setExecutingFn(null)
        }
      }

      if (isLastStep) {
        const allAnswers = Array.from(
          new Map(answers).set(question.id, { questionId: question.id, answer: approved }).values(),
        )
        setSubmitted(true)
        onSubmitAnswers(allAnswers, questions)
      } else {
        setCurrentStep((s) => s + 1)
      }
    },
    [onExecuteFunction, isLastStep, answers, onSubmitAnswers, questions, setAnswer],
  )

  // ── Wizard derived state — must be declared before any early return ──

  const stepperSteps = useMemo(
    () => questions.map((q) => ({ id: q.id, label: getStepLabel(q) })),
    [questions],
  )

  const answeredIds = useMemo(() => new Set(answers.keys()), [answers])

  const handleStepClick = useCallback((index: number) => {
    setCurrentStep(index)
  }, [])

  const handleBack = useCallback(() => {
    setCurrentStep((s) => Math.max(0, s - 1))
  }, [])

  const handleSkip = useCallback(() => {
    if (isLastStep) {
      const allAnswers = Array.from(answers.values())
      setSubmitted(true)
      onSubmitAnswers(allAnswers, questions)
      return
    }
    setCurrentStep((s) => s + 1)
  }, [isLastStep, answers, onSubmitAnswers, questions])

  // ── Answered state (read-only) ─────────────────────────────────

  if (submitted || isAnswered) {
    return <AnsweredDisplay questions={questions} answers={answers} fnResults={fnResults} />
  }

  // ── Interactive state — VS Code-style wizard ──────────────────

  // Skip is offered only for free-form types where the user may legitimately
  // pass without an answer. Confirm + function_confirm have explicit Yes/No.
  let skipHandler: (() => void) | undefined
  if (
    currentQuestion?.type === 'text' ||
    currentQuestion?.type === 'multi_choice'
  ) {
    skipHandler = handleSkip
  }

  return (
    <div className="my-3 rounded-xl border border-border/40 bg-muted/30 overflow-hidden">
      {/* VS Code-like numbered stepper (hidden when only one question) */}
      {questions.length > 1 && (
        <Stepper
          steps={stepperSteps}
          currentIndex={currentStep}
          answeredIds={answeredIds}
          onStepClick={handleStepClick}
        />
      )}

      {/* Current question */}
      <div className="px-4 py-3">
        <p className="text-sm font-medium text-foreground mb-1">{currentQuestion.question}</p>
        {currentQuestion.description && (
          <p className="text-xs text-muted-foreground mb-3">{currentQuestion.description}</p>
        )}

        {/* Answer controls */}
        <div className="mt-3">
          {currentQuestion.type === 'confirm' && (
            <ConfirmControls onConfirm={handleConfirm} />
          )}
          {currentQuestion.type === 'single_choice' && currentQuestion.options && (
            <SingleChoiceControls
              options={currentQuestion.options}
              selected={answers.get(currentQuestion.id)?.answer as string | undefined}
              onSelect={(val) => setAnswer(currentQuestion.id, val)}
            />
          )}
          {currentQuestion.type === 'multi_choice' && currentQuestion.options && (
            <MultiChoiceControls
              options={currentQuestion.options}
              selected={(answers.get(currentQuestion.id)?.answer as string[]) ?? []}
              onToggle={(val) => {
                const current = (answers.get(currentQuestion.id)?.answer as string[]) ?? []
                const next = current.includes(val) ? current.filter((v) => v !== val) : [...current, val]
                setAnswer(currentQuestion.id, next)
              }}
            />
          )}
          {currentQuestion.type === 'text' && (
            <TextControl
              value={(answers.get(currentQuestion.id)?.answer as string) ?? ''}
              onChange={(val) => setAnswer(currentQuestion.id, val)}
            />
          )}
          {currentQuestion.type === 'function_confirm' && (
            <FunctionConfirmControls
              question={currentQuestion}
              isExecuting={executingFn === currentQuestion.id}
              onExecute={(approved) => handleFunctionExecute(currentQuestion, approved)}
            />
          )}
        </div>

        {/* Navigation — always shown except for confirm / function_confirm,
            which auto-advance via their own Yes/No buttons. The stepper above
            still lets the user jump back to revisit them. */}
        {currentQuestion.type !== 'confirm' && currentQuestion.type !== 'function_confirm' && (
          <WizardFooter
            totalSteps={questions.length}
            answeredCount={answeredIds.size}
            isBackDisabled={currentStep === 0}
            isNextDisabled={!hasCurrentAnswer}
            isLastStep={isLastStep}
            onBack={handleBack}
            onSkip={skipHandler}
            onNext={handleNext}
          />
        )}

        {/* For confirm / function_confirm types, still expose Back so users
            can correct an earlier mistake without losing their work. */}
        {(currentQuestion.type === 'confirm' || currentQuestion.type === 'function_confirm') &&
          currentStep > 0 && (
            <div className="flex justify-start mt-3 pt-2 border-t border-border/20">
              <Button size="xs" variant="ghost" onClick={handleBack}>
                ← Back
              </Button>
            </div>
          )}
      </div>
    </div>
  )
})

/** Short stepper label inferred from a question — kept under ~10 chars. */
function getStepLabel(q: AIQuestion): string {
  const labels: Record<AIQuestion['type'], string> = {
    confirm: 'Confirm',
    single_choice: 'Choose',
    multi_choice: 'Select',
    text: 'Answer',
    function_confirm: 'Tool',
  }
  return labels[q.type]
}

// ── Confirm Controls ───────────────────────────────────────────────

function ConfirmControls({
  onConfirm,
}: {
  onConfirm: (value: boolean) => void
}): React.JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <Button size="xs" variant="default" onClick={() => onConfirm(true)}>
        <Check size={12} />
        Yes
      </Button>
      <Button size="xs" variant="outline" onClick={() => onConfirm(false)}>
        <X size={12} />
        No
      </Button>
    </div>
  )
}

// ── Single Choice Controls ─────────────────────────────────────────

function SingleChoiceControls({
  options,
  selected,
  onSelect,
}: {
  options: string[]
  selected: string | undefined
  onSelect: (value: string) => void
}): React.JSX.Element {
  return (
    <div className="flex flex-col gap-1.5">
      {options.map((opt) => {
        const isSelected = selected === opt
        return (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left transition-all cursor-pointer border ${
              isSelected
                ? 'bg-primary/10 border-primary/40 text-foreground'
                : 'bg-muted/20 border-border/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:border-border/50'
            }`}
          >
            <CircleDot size={14} className={isSelected ? 'text-primary' : 'text-muted-foreground/40'} />
            {opt}
          </button>
        )
      })}
    </div>
  )
}

// ── Multi Choice Controls ──────────────────────────────────────────

function MultiChoiceControls({
  options,
  selected,
  onToggle,
}: {
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
}): React.JSX.Element {
  return (
    <div className="flex flex-col gap-1.5">
      {options.map((opt) => {
        const isSelected = selected.includes(opt)
        return (
          <button
            key={opt}
            onClick={() => onToggle(opt)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-left transition-all cursor-pointer border ${
              isSelected
                ? 'bg-primary/10 border-primary/40 text-foreground'
                : 'bg-muted/20 border-border/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground hover:border-border/50'
            }`}
          >
            {isSelected ? (
              <CheckSquare size={14} className="text-primary" />
            ) : (
              <Square size={14} className="text-muted-foreground/40" />
            )}
            {opt}
          </button>
        )
      })}
    </div>
  )
}

// ── Text Control ───────────────────────────────────────────────────

function TextControl({
  value,
  onChange,
}: {
  value: string
  onChange: (value: string) => void
}): React.JSX.Element {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Type your answer…"
      rows={2}
      className="w-full min-h-[64px] resize-y rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    />
  )
}

// ── Function Confirm Controls ──────────────────────────────────────

function FunctionConfirmControls({
  question,
  isExecuting,
  onExecute,
}: {
  question: AIQuestion
  isExecuting: boolean
  onExecute: (approved: boolean) => void
}): React.JSX.Element {
  const fc = question.functionCall
  if (!fc) return <></>

  const meta = getFunctionMeta(fc.name)
  const autoExec = shouldAutoExecute(fc.name)
  const argSummary = formatArgs(fc.name, fc.args)

  return (
    <div className="rounded-lg border border-border/30 bg-muted/20 p-3">
      {/* Tool info */}
      <div className="flex items-center gap-2 mb-2">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Terminal size={14} className="text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <span className="block text-xs font-medium text-foreground">
            {meta?.description ?? fc.name}
          </span>
          {argSummary && (
            <span className="block text-[10px] text-muted-foreground/60 truncate">
              {argSummary}
            </span>
          )}
        </div>
        {autoExec && (
          <Badge variant="secondary" className="text-[9px] shrink-0">
            Auto-approved
          </Badge>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          size="xs"
          variant="default"
          onClick={() => onExecute(true)}
          disabled={isExecuting}
        >
          {isExecuting ? (
            <>
              <AppLoaderGlyph size={12} />
              Executing…
            </>
          ) : (
            <>
              <ChevronRight size={12} />
              Execute
            </>
          )}
        </Button>
        <Button
          size="xs"
          variant="outline"
          onClick={() => onExecute(false)}
          disabled={isExecuting}
        >
          <X size={12} />
          Decline
        </Button>
      </div>
    </div>
  );
}

// ── Answered Display (read-only) ───────────────────────────────────

const AnsweredDisplay = memo(function AnsweredDisplay({
  questions,
  answers,
  fnResults,
}: {
  questions: AIQuestion[]
  answers: Map<string, AIQuestionAnswer>
  fnResults: Map<string, string>
}): React.JSX.Element {
  return (
    <div className="my-3 rounded-lg border border-border/20 bg-muted/10 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border/20">
        <Check size={12} className="text-success" />
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Answered
        </span>
        <Badge variant="secondary" className="text-[9px] ml-auto">
          {questions.length} question{questions.length > 1 ? 's' : ''}
        </Badge>
      </div>
      <div className="divide-y divide-border/10">
        {questions.map((q) => {
          const answer = answers.get(q.id)
          const fnResult = fnResults.get(q.id)
          return (
            <div key={q.id} className="px-3 py-2">
              <p className="text-xs text-muted-foreground">{q.question}</p>
              <p className="text-xs font-medium text-foreground mt-0.5">
                → {formatDisplayAnswer(answer)}
              </p>
              {fnResult && (
                <pre className="mt-1 text-[10px] leading-4 text-muted-foreground/80 bg-muted/40 rounded p-2 max-h-24 overflow-auto whitespace-pre-wrap">
                  {fnResult.length > 300
                    ? `${fnResult.slice(0, 300)}…`
                    : fnResult}
                </pre>
              )}
            </div>
          );
        })}
      </div>
    </div>
  )
})

function formatDisplayAnswer(answer: AIQuestionAnswer | undefined): string {
  if (!answer) return 'No answer'
  const val = answer.answer
  if (typeof val === 'boolean') return val ? 'Yes' : 'No'
  if (Array.isArray(val)) return val.join(', ')
  return String(val)
}

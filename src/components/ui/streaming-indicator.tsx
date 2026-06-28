import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { getAllFacts, refreshFactsFromAI } from './streaming-facts'

interface StreamingIndicatorProps {
  className?: string
  label?: string
}

/**
 * "Did You Know" — while the AI is working, surface a short, genuinely
 * interesting fact instead of a spinner.
 *
 * No-repeat guarantee: every shown fact is recorded in localStorage with a
 * timestamp, and a fact is only eligible again once **6 months** have passed
 * since it was last seen. Selection always prefers never-seen / expired
 * facts; only if the entire pool has been shown within the window does it
 * fall back to the least-recently-seen one (maximising the gap). When the
 * unseen pool is about to run out, expired history entries are auto-pruned
 * so older facts cleanly re-enter rotation.
 *
 * Public API (`label`, `className`) is preserved. A small pulsing dot keeps
 * a sense of liveliness; the fact text cross-fades on each rotation.
 *
 * Respects `prefers-reduced-motion` by dropping the pulse and cross-fade.
 */
// Flat pool of every fact, sourced from the category-organised facts file.
// Read lazily via getAllFacts() so AI-generated facts fetched on app restart
// (and persisted in localStorage) are picked up without a reload.

const HISTORY_KEY = "genisys:streaming-fact-history:v1";
const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 182; // ~6 months

type FactHistory = Record<string, number>; // fact text -> last-shown epoch ms

function readHistory(): FactHistory {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as FactHistory) : {};
  } catch {
    return {};
  }
}

function writeHistory(history: FactHistory): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {
    /* storage unavailable / quota — degrade gracefully */
  }
}

// Picks the next fact that hasn't been shown in the last 6 months. Records
// the choice (with timestamp) so it stays out of rotation for 6 months, and
// prunes expired entries when the unseen pool is about to run dry.
function nextFact(): string {
  const now = Date.now();
  const history = readHistory();
  const FACTS = getAllFacts();

  // Eligible = never shown, or last shown more than 6 months ago.
  const eligible = FACTS.filter((f) => {
    const last = history[f];
    return last === undefined || now - last > SIX_MONTHS_MS;
  });

  let chosen: string;
  if (eligible.length > 0) {
    chosen = eligible[Math.floor(Math.random() * eligible.length)];
  } else {
    // Whole pool seen within the window — fall back to the least-recently
    // seen fact to maximise the gap before any repeat.
    chosen = FACTS.reduce((oldest, f) =>
      (history[f] ?? 0) < (history[oldest] ?? 0) ? f : oldest,
    FACTS[0]);
  }

  history[chosen] = now;

  // Pool about to expire (few unseen facts left): prune expired entries so
  // older facts auto-rejoin rotation and storage stays bounded.
  if (eligible.length <= Math.max(3, Math.ceil(FACTS.length * 0.1))) {
    for (const key of Object.keys(history)) {
      if (now - history[key] > SIX_MONTHS_MS || !FACTS.includes(key)) {
        delete history[key];
      }
    }
    history[chosen] = now; // keep the one we just showed
  }

  writeHistory(history);
  return chosen;
}

const ROTATE_MS = 15000;
const FADE_MS = 300;

export function StreamingIndicator({ className, label }: StreamingIndicatorProps): React.JSX.Element {
  const [fact, setFact] = useState<string>(() => nextFact());
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // On app restart, fetch a fresh batch of AI-generated facts and append
    // them to the persisted pool. Runs at most once per session; failures are
    // silent and never affect the built-in facts.
    void refreshFactsFromAI();

    let swapTimer: ReturnType<typeof setTimeout>;
    const rotate = setInterval(() => {
      setVisible(false);
      swapTimer = setTimeout(() => {
        setFact(nextFact());
        setVisible(true);
      }, FADE_MS);
    }, ROTATE_MS);
    return () => {
      clearInterval(rotate);
      clearTimeout(swapTimer);
    };
  }, []);

  return (
    <span
      className={cn("genisys-fact align-middle", className)}
      role="status"
      aria-live="polite"
      aria-label={label ?? "Working"}
    >
      <span className="genisys-fact-wave" aria-hidden>
        <span className="genisys-fact-ball" />
        <span className="genisys-fact-ball" />
        <span className="genisys-fact-ball" />
        <span className="genisys-fact-ball" />
      </span>
      <span className="genisys-fact-lead">{label ?? "Did you know"}</span>
      <span className={cn("genisys-fact-text", visible ? "is-in" : "is-out")}>
        {fact}
      </span>
      <FactStyles />
    </span>
  );
}

function FactStyles(): React.JSX.Element {
  return (
    <style>{`
      .genisys-fact {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        vertical-align: -2px;
        max-width: 100%;
        font-size: 0.92em;
        line-height: 1.45;
        color: var(--color-muted-foreground);
      }

      /* Five same-colour balls bouncing in sequence to read as a wave. */
      .genisys-fact-wave {
        flex: none;
        display: inline-flex;
        align-items: center;
        gap: 3px;
        height: 1em;
      }
      .genisys-fact-ball {
        display: block;
        width: 5px;
        height: 5px;
        border-radius: 50%;
        background: var(--color-primary);
        box-shadow: 0 0 4px color-mix(in oklab, var(--color-primary) 45%, transparent);
        animation: genisys-fact-wave 1.1s ease-in-out infinite;
      }
      .genisys-fact-ball:nth-child(1) { animation-delay: 0s; }
      .genisys-fact-ball:nth-child(2) { animation-delay: 0.12s; }
      .genisys-fact-ball:nth-child(3) { animation-delay: 0.24s; }
      .genisys-fact-ball:nth-child(4) { animation-delay: 0.36s; }
      .genisys-fact-ball:nth-child(5) { animation-delay: 0.48s; }

      .genisys-fact-lead {
        flex: none;
        font-weight: 600;
        color: var(--color-foreground);
      }
      .genisys-fact-lead::after {
        content: "\\2009\\00B7\\2009";
        color: var(--color-muted-foreground);
        font-weight: 400;
      }

      /* Fact text cross-fades on each rotation, with a soft highlight that
         sweeps left → right across the words like a passing light. */
      .genisys-fact-text {
        background: linear-gradient(
          100deg,
          var(--color-muted-foreground) 0%,
          var(--color-muted-foreground) 35%,
          var(--color-foreground) 50%,
          var(--color-muted-foreground) 65%,
          var(--color-muted-foreground) 100%
        );
        background-size: 220% 100%;
        background-position: 200% 0;
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
        color: transparent;
        animation: genisys-fact-shine 3.2s linear infinite;
        transition: opacity ${FADE_MS}ms ease, transform ${FADE_MS}ms ease;
      }
      .genisys-fact-text.is-in  { opacity: 1; transform: translateY(0); }
      .genisys-fact-text.is-out { opacity: 0; transform: translateY(2px); }

      @keyframes genisys-fact-shine {
        0%   { background-position: 200% 0; }
        100% { background-position: -100% 0; }
      }

      @keyframes genisys-fact-wave {
        0%, 100% { transform: translateY(2.5px); opacity: 0.5; }
        50%      { transform: translateY(-2.5px); opacity: 1; }
      }

      @media (prefers-reduced-motion: reduce) {
        .genisys-fact-ball {
          animation: none !important;
          transform: none !important;
          opacity: 0.8;
        }
        .genisys-fact-text {
          animation: none !important;
          transition: none !important;
          transform: none !important;
          background: none !important;
          -webkit-text-fill-color: var(--color-muted-foreground) !important;
          color: var(--color-muted-foreground) !important;
        }
      }
    `}</style>
  );
}

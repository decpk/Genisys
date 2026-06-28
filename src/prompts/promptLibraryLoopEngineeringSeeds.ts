import type { PmCategory, PmFolder, PmPrompt } from '@/store/prompt-manager-store'

const NOW = '2026-06-21T00:00:00.000Z'

/**
 * Built-in "Loop Engineering" library — a curated, global collection of the
 * famous agentic loop patterns that drive iterative reason→act→observe work:
 * ReAct, reflection/self-critique, evaluator–optimizer, planning/search loops,
 * and memory/control loops. The folder has no `scopes`, so it surfaces in every
 * prompt picker (Chat, etc.), like the Developer Library. Each prompt's
 * `description` states precisely what the loop does; each `content` is a
 * ready-to-use, fill-in template.
 */
export const LOOP_ENGINEERING_FOLDER: PmFolder = {
  id: 'f-loop-builtin-0001',
  name: 'Loop Engineering',
  color: '#f43f5e',
  sortOrder: -5,
  createdAt: NOW,
  updatedAt: NOW,
  isBuiltIn: true,
}

export const LOOP_ENGINEERING_CATEGORIES: PmCategory[] = [
  {
    id: 'c-loop-builtin-0001',
    folderId: LOOP_ENGINEERING_FOLDER.id,
    name: 'Reason–Act Loops',
    icon: '',
    sortOrder: 0,
    createdAt: NOW,
    updatedAt: NOW,
    isBuiltIn: true,
  },
  {
    id: 'c-loop-builtin-0002',
    folderId: LOOP_ENGINEERING_FOLDER.id,
    name: 'Reflection & Self-Critique',
    icon: '',
    sortOrder: 1,
    createdAt: NOW,
    updatedAt: NOW,
    isBuiltIn: true,
  },
  {
    id: 'c-loop-builtin-0003',
    folderId: LOOP_ENGINEERING_FOLDER.id,
    name: 'Evaluation & Optimization',
    icon: '',
    sortOrder: 2,
    createdAt: NOW,
    updatedAt: NOW,
    isBuiltIn: true,
  },
  {
    id: 'c-loop-builtin-0004',
    folderId: LOOP_ENGINEERING_FOLDER.id,
    name: 'Planning & Search Loops',
    icon: '',
    sortOrder: 3,
    createdAt: NOW,
    updatedAt: NOW,
    isBuiltIn: true,
  },
  {
    id: 'c-loop-builtin-0005',
    folderId: LOOP_ENGINEERING_FOLDER.id,
    name: 'Memory & Control Loops',
    icon: '',
    sortOrder: 4,
    createdAt: NOW,
    updatedAt: NOW,
    isBuiltIn: true,
  },
]

const CAT_REASON_ACT = LOOP_ENGINEERING_CATEGORIES[0].id
const CAT_REFLECT = LOOP_ENGINEERING_CATEGORIES[1].id
const CAT_EVAL = LOOP_ENGINEERING_CATEGORIES[2].id
const CAT_PLAN = LOOP_ENGINEERING_CATEGORIES[3].id
const CAT_MEMORY = LOOP_ENGINEERING_CATEGORIES[4].id

export const LOOP_ENGINEERING_PROMPTS: PmPrompt[] = [
  // ── Reason–Act Loops ─────────────────────────────────────────────
  {
    id: 'p-loop-builtin-0101-react',
    folderId: LOOP_ENGINEERING_FOLDER.id,
    categoryId: CAT_REASON_ACT,
    title: 'ReAct (Reason + Act + Observe)',
    description: 'Interleave Thought, Action, and Observation steps until the task is solved.',
    content: `Solve the task by alternating Thought, Action, and Observation until done.

Task: [state it]
Available actions/tools: [e.g. search, read_file, calculator — or describe what each step would do]

Loop this format:
Thought: [reasoning about what to do next]
Action: [the single next action + its input]
Observation: [result of the action]
... repeat ...
When you have enough information:
Final Answer: [the answer]

Rules: one action per step; let observations change your plan; stop as soon as the task is satisfied.`,
    isPinned: false,
    sortOrder: 0,
    createdAt: NOW,
    updatedAt: NOW,
    isBuiltIn: true,
  },
  {
    id: 'p-loop-builtin-0102-plan-and-execute',
    folderId: LOOP_ENGINEERING_FOLDER.id,
    categoryId: CAT_REASON_ACT,
    title: 'Plan-and-Execute',
    description: 'Build a full plan up front, execute step by step, and replan when steps fail.',
    content: `Operate as a plan-and-execute agent.

Goal: [state it]

Phase 1 — Plan: produce an ordered, numbered plan of discrete steps to reach the goal.
Phase 2 — Execute: work the plan one step at a time. After each step, report the step, the result, and whether the plan still holds.
Phase 3 — Replan if needed: if a step fails or reveals new information, update the remaining plan and continue.

Stop when the goal is met; summarize what was done.`,
    isPinned: false,
    sortOrder: 1,
    createdAt: NOW,
    updatedAt: NOW,
    isBuiltIn: true,
  },
  {
    id: 'p-loop-builtin-0103-tool-use-loop',
    folderId: LOOP_ENGINEERING_FOLDER.id,
    categoryId: CAT_REASON_ACT,
    title: 'Tool-Use Loop',
    description: 'Pick one tool per iteration, read the result, and decide to continue or finish.',
    content: `You are an agent that accomplishes the goal by calling tools in a loop.

Goal: [state it]
Tools: [list each tool, what it does, and its inputs]

Each iteration:
1. State the current sub-goal.
2. Choose ONE tool and the exact input, with a one-line reason.
3. Read the (real or simulated) result.
4. Decide: continue, switch approach, or finish.

Avoid redundant calls; reuse results you already have. Finish with a concise result and the key evidence gathered.`,
    isPinned: false,
    sortOrder: 2,
    createdAt: NOW,
    updatedAt: NOW,
    isBuiltIn: true,
  },
  {
    id: 'p-loop-builtin-0104-orchestrator-worker',
    folderId: LOOP_ENGINEERING_FOLDER.id,
    categoryId: CAT_REASON_ACT,
    title: 'Orchestrator–Worker Delegation',
    description: 'Split an objective into worker briefs, run each, then integrate the results.',
    content: `Act as an orchestrator coordinating worker sub-agents.

Objective: [state it]

1. Decompose the objective into independent worker tasks; give each a crisp brief (input, expected output, done-criteria).
2. For each worker task, produce the worker's output (play the worker role).
3. As orchestrator, review each result, request fixes where needed, and integrate them.
4. Return the final integrated deliverable plus a short note on how the work was split.`,
    isPinned: false,
    sortOrder: 3,
    createdAt: NOW,
    updatedAt: NOW,
    isBuiltIn: true,
  },
  {
    id: 'p-loop-builtin-0105-router-dispatch',
    folderId: LOOP_ENGINEERING_FOLDER.id,
    categoryId: CAT_REASON_ACT,
    title: 'Router / Dispatch',
    description: 'Classify the request first, then route it to the matching handling strategy.',
    content: `First classify the request, then route it to the matching handling strategy.

Request: [state it]

Routes:
- [Route A: when ... -> handle by ...]
- [Route B: when ... -> handle by ...]
- [Route C: when ... -> handle by ...]

1. Decide which route applies and why (one line).
2. If none fit or it is ambiguous, ask one clarifying question instead of guessing.
3. Execute the chosen route's strategy and return the result.`,
    isPinned: false,
    sortOrder: 4,
    createdAt: NOW,
    updatedAt: NOW,
    isBuiltIn: true,
  },

  // ── Reflection & Self-Critique ───────────────────────────────────
  {
    id: 'p-loop-builtin-0201-reflexion',
    folderId: LOOP_ENGINEERING_FOLDER.id,
    categoryId: CAT_REFLECT,
    title: 'Reflexion (Learn From Failure)',
    description: 'Diagnose why a prior attempt failed, turn it into rules, and retry with the lessons.',
    content: `Use a reflexion loop: attempt, reflect on what went wrong, then retry with the lessons.

Task: [state it]
Previous attempt & outcome: [paste the failed/weak attempt and how it fell short, or "first attempt"]

1. Reflect: in a few bullets, diagnose specifically why the previous attempt failed or was weak.
2. Lessons: turn each into a concrete rule to follow this time.
3. Retry: produce a new attempt that applies the lessons.
4. Note which lessons changed the outcome.`,
    isPinned: false,
    sortOrder: 0,
    createdAt: NOW,
    updatedAt: NOW,
    isBuiltIn: true,
  },
  {
    id: 'p-loop-builtin-0202-self-refine',
    folderId: LOOP_ENGINEERING_FOLDER.id,
    categoryId: CAT_REFLECT,
    title: 'Self-Refine (Draft → Critique → Improve)',
    description: 'Draft, critique your own draft for concrete flaws, and revise until solid.',
    content: `Improve your own output through draft → critique → revision.

Task: [state it]

1. Draft: produce a first version.
2. Critique: as a demanding reviewer, list specific weaknesses (clarity, correctness, completeness, style) — be concrete and quote the problem spots.
3. Revise: rewrite to fix every critique.
4. Repeat the critique/revise cycle once more if material issues remain.

Return the final version and a one-line changelog.`,
    isPinned: false,
    sortOrder: 1,
    createdAt: NOW,
    updatedAt: NOW,
    isBuiltIn: true,
  },
  {
    id: 'p-loop-builtin-0203-actor-critic',
    folderId: LOOP_ENGINEERING_FOLDER.id,
    categoryId: CAT_REFLECT,
    title: 'Actor–Critic',
    description: 'Alternate an actor proposing and a critic scoring until objections are resolved.',
    content: `Run an actor-critic exchange to reach a strong result.

Task: [state it]

- ACTOR: propose a solution.
- CRITIC: evaluate it against [criteria/goal], scoring it and naming the top issues to fix.
- ACTOR: revise based on the critique.

Repeat for up to 3 rounds or until the CRITIC has no material objections. Output the final solution and the critic's final sign-off.`,
    isPinned: false,
    sortOrder: 2,
    createdAt: NOW,
    updatedAt: NOW,
    isBuiltIn: true,
  },
  {
    id: 'p-loop-builtin-0204-cove-loop',
    folderId: LOOP_ENGINEERING_FOLDER.id,
    categoryId: CAT_REFLECT,
    title: 'Chain-of-Verification Loop',
    description: 'Iterate verification-question rounds until an answer passes with no corrections.',
    content: `Iterate until the answer survives its own verification questions.

Question: [state it]

Round structure:
1. Current answer: [draft, or carry forward the revised one].
2. Generate verification questions that would catch errors in it.
3. Answer them independently.
4. If any reveals a problem, produce a corrected answer and run another round.

Stop when a full round passes with no corrections. Return the final answer.`,
    isPinned: false,
    sortOrder: 3,
    createdAt: NOW,
    updatedAt: NOW,
    isBuiltIn: true,
  },

  // ── Evaluation & Optimization ────────────────────────────────────
  {
    id: 'p-loop-builtin-0301-evaluator-optimizer',
    folderId: LOOP_ENGINEERING_FOLDER.id,
    categoryId: CAT_EVAL,
    title: 'Evaluator–Optimizer',
    description: 'Generate, score against criteria, and regenerate the weakest part until the target is hit.',
    content: `Optimize the output via a generate → evaluate → improve loop with an explicit score.

Task: [state it]
Scoring criteria (define "good"): [e.g. correctness 0-5, clarity 0-5, completeness 0-5]

1. Generate a candidate.
2. Evaluate it against each criterion with a numeric score and justification; compute the total.
3. If the total < [target], identify the lowest-scoring criterion and regenerate to improve it specifically.
4. Repeat up to [N] rounds, keeping the best-scoring version. Return the best candidate and its scores.`,
    isPinned: false,
    sortOrder: 0,
    createdAt: NOW,
    updatedAt: NOW,
    isBuiltIn: true,
  },
  {
    id: 'p-loop-builtin-0302-llm-as-judge',
    folderId: LOOP_ENGINEERING_FOLDER.id,
    categoryId: CAT_EVAL,
    title: 'LLM-as-Judge Scoring',
    description: 'Score one or more candidates against a rubric impartially, with evidence per criterion.',
    content: `Act as an impartial judge scoring the candidate(s) against a rubric.

Item(s) to judge:
[paste candidate A]
[paste candidate B, if comparing]

Rubric: [criteria, each with a scale, e.g. accuracy /5, helpfulness /5, safety /5]

1. Score each item per criterion with a one-line justification quoting evidence.
2. Avoid position and length bias; judge only on the rubric.
3. Give the total and a verdict (winner, or pass/fail vs threshold). Be specific about what would raise the score.`,
    isPinned: false,
    sortOrder: 1,
    createdAt: NOW,
    updatedAt: NOW,
    isBuiltIn: true,
  },
  {
    id: 'p-loop-builtin-0303-test-driven-iteration',
    folderId: LOOP_ENGINEERING_FOLDER.id,
    categoryId: CAT_EVAL,
    title: 'Test-Driven Iteration',
    description: 'Write test cases first, then iterate the solution until every test passes.',
    content: `Solve by writing the tests first, then iterating the solution until they pass.

Requirement: [state it]

1. Specify: write concrete test cases (inputs -> expected outputs), including edge cases, BEFORE any solution.
2. Implement: write the solution.
3. Run (or trace) each test; show pass/fail.
4. For every failure, fix the solution and re-run all tests.

Stop when all tests pass. Return the final solution and the passing test table.`,
    isPinned: false,
    sortOrder: 2,
    createdAt: NOW,
    updatedAt: NOW,
    isBuiltIn: true,
  },
  {
    id: 'p-loop-builtin-0304-best-of-n',
    folderId: LOOP_ENGINEERING_FOLDER.id,
    categoryId: CAT_EVAL,
    title: 'Best-of-N Selection',
    description: 'Generate several diverse candidates, compare against criteria, and pick the best.',
    content: `Generate several independent candidates and select the best.

Task: [state it]

1. Produce [N] diverse, independently-generated candidates (vary the approach, not just the wording).
2. Define selection criteria: [what makes one best].
3. Compare candidates head-to-head against the criteria in a short table.
4. Pick the winner and explain why; optionally merge the best parts of the others into it.`,
    isPinned: false,
    sortOrder: 3,
    createdAt: NOW,
    updatedAt: NOW,
    isBuiltIn: true,
  },
  {
    id: 'p-loop-builtin-0305-reward-guided-retry',
    folderId: LOOP_ENGINEERING_FOLDER.id,
    categoryId: CAT_EVAL,
    title: 'Reward-Guided Retry',
    description: 'Define an explicit reward, then retry to raise the score until it stops improving.',
    content: `Improve toward a target by retrying against an explicit reward signal.

Task: [state it]
Reward (higher = better): [define how to measure quality, e.g. "# of requirements met minus # of violations"]

1. Attempt, then compute the reward and show the calculation.
2. Diagnose what cost reward points.
3. Retry aiming to raise the reward; recompute.

Repeat until the reward stops improving or hits [target]. Return the highest-reward attempt.`,
    isPinned: false,
    sortOrder: 4,
    createdAt: NOW,
    updatedAt: NOW,
    isBuiltIn: true,
  },

  // ── Planning & Search Loops ──────────────────────────────────────
  {
    id: 'p-loop-builtin-0401-goal-decomposition',
    folderId: LOOP_ENGINEERING_FOLDER.id,
    categoryId: CAT_PLAN,
    title: 'Goal Decomposition Loop',
    description: 'Break a goal into subgoals and close them one at a time, replanning as you go.',
    content: `Reach the goal by iteratively decomposing it and closing subgoals.

Goal: [state it]

1. Break the goal into subgoals; mark each as OPEN.
2. Pick the highest-leverage OPEN subgoal, work it, and mark it DONE (or split it further if still too big).
3. After each subgoal, restate what is left and whether the plan changed.

Loop until every subgoal is DONE, then assemble the final result.`,
    isPinned: false,
    sortOrder: 0,
    createdAt: NOW,
    updatedAt: NOW,
    isBuiltIn: true,
  },
  {
    id: 'p-loop-builtin-0402-recursive-breakdown',
    folderId: LOOP_ENGINEERING_FOLDER.id,
    categoryId: CAT_PLAN,
    title: 'Recursive Task Breakdown',
    description: 'Recursively split tasks until each leaf is trivial, then compose results bottom-up.',
    content: `Apply recursive decomposition: split any task that is not directly doable into smaller ones, until each leaf is trivial.

Top task: [state it]

For each task:
- If it can be done in one clear step, do it (leaf).
- Otherwise split it into 2-4 subtasks and recurse into each.

Render the result as an indented tree showing tasks, their subtasks, and the leaf outputs. Then compose the leaves bottom-up into the final deliverable.`,
    isPinned: false,
    sortOrder: 1,
    createdAt: NOW,
    updatedAt: NOW,
    isBuiltIn: true,
  },
  {
    id: 'p-loop-builtin-0403-hypothesis-test-refine',
    folderId: LOOP_ENGINEERING_FOLDER.id,
    categoryId: CAT_PLAN,
    title: 'Hypothesis–Test–Refine',
    description: 'Loop hypothesis → cheapest test → update until the root cause is confirmed (great for debugging).',
    content: `Investigate using a hypothesis loop (good for debugging and open problems).

Problem / symptom: [describe]
Known facts: [list]

Each cycle:
1. Hypothesis: the most likely explanation and why.
2. Test: the cheapest check that would confirm or refute it, and the expected result for each outcome.
3. Result: [actual or reasoned outcome].
4. Update: keep, discard, or refine the hypothesis.

Continue until one hypothesis is confirmed. State the root cause and the fix.`,
    isPinned: false,
    sortOrder: 2,
    createdAt: NOW,
    updatedAt: NOW,
    isBuiltIn: true,
  },
  {
    id: 'p-loop-builtin-0404-tree-search-loop',
    folderId: LOOP_ENGINEERING_FOLDER.id,
    categoryId: CAT_PLAN,
    title: 'Tree-Search / ToT Loop',
    description: 'Expand, score, prune, and descend through a search tree, backtracking on dead ends.',
    content: `Search the solution space like a tree, expanding promising branches and pruning dead ends.

Problem: [state it]

1. Root: define the start state and the goal test.
2. Expand: from the current node, generate candidate next moves/ideas.
3. Evaluate: score each child for promise; prune the weak ones (say why).
4. Select: descend into the best child and repeat from step 2.
5. Backtrack if a branch stalls.

Continue until the goal test passes. Report the winning path from root to solution.`,
    isPinned: false,
    sortOrder: 3,
    createdAt: NOW,
    updatedAt: NOW,
    isBuiltIn: true,
  },

  // ── Memory & Control Loops ───────────────────────────────────────
  {
    id: 'p-loop-builtin-0501-scratchpad-memory',
    folderId: LOOP_ENGINEERING_FOLDER.id,
    categoryId: CAT_MEMORY,
    title: 'Scratchpad Working Memory',
    description: 'Keep an explicit, continuously-updated scratchpad of state across a multi-step task.',
    content: `Maintain an explicit scratchpad of working memory as you solve a multi-step task.

Task: [state it]

Keep and update a SCRATCHPAD with: Known facts, Current goal, Steps done, Next step, Open questions.
After each step, reprint the updated SCRATCHPAD, then act. This keeps state explicit and prevents losing track.

When the task is done, give the final answer and a clean final scratchpad.`,
    isPinned: false,
    sortOrder: 0,
    createdAt: NOW,
    updatedAt: NOW,
    isBuiltIn: true,
  },
  {
    id: 'p-loop-builtin-0502-summarize-and-continue',
    folderId: LOOP_ENGINEERING_FOLDER.id,
    categoryId: CAT_MEMORY,
    title: 'Summarize-and-Continue (Compaction)',
    description: 'Periodically checkpoint a compact summary so a long task can continue past context limits.',
    content: `For a long-running task, periodically compress context so you can keep going without losing essentials.

Task so far / transcript:
"""
[paste progress]
"""

1. Checkpoint summary: capture decisions made, current state, remaining steps, and constraints — compact and self-contained.
2. Continue: proceed with the next steps using the checkpoint as your memory.
3. When context grows large again, repeat the checkpoint before continuing.`,
    isPinned: false,
    sortOrder: 1,
    createdAt: NOW,
    updatedAt: NOW,
    isBuiltIn: true,
  },
  {
    id: 'p-loop-builtin-0503-stop-condition',
    folderId: LOOP_ENGINEERING_FOLDER.id,
    categoryId: CAT_MEMORY,
    title: 'Stop-Condition / Termination Design',
    description: 'Define success, give-up, and budget conditions up front so the loop never spins.',
    content: `Before looping on this task, define when to STOP so you do not spin or over-work.

Task: [state it]

1. Success condition: exactly what "done" looks like (observable).
2. Failure / give-up condition: when to stop and report inability (e.g. no progress after [N] tries, missing prerequisite).
3. Budget: max iterations / max actions = [N].

Then execute the loop, checking these conditions after every iteration, and report which condition ended the loop.`,
    isPinned: false,
    sortOrder: 2,
    createdAt: NOW,
    updatedAt: NOW,
    isBuiltIn: true,
  },
  {
    id: 'p-loop-builtin-0504-progress-budget-guardrail',
    folderId: LOOP_ENGINEERING_FOLDER.id,
    categoryId: CAT_MEMORY,
    title: 'Progress & Budget Guardrail',
    description: 'Track progress against a fixed budget each iteration and change strategy when stalled.',
    content: `Run the task as a loop that tracks progress against a fixed budget and avoids wasted effort.

Task: [state it]
Budget: [e.g. 5 steps / 3 tool calls]

Each iteration, report a one-line ledger: Step k/N | what was attempted | progress made (yes/no) | budget left.
- If two consecutive steps make no progress, change strategy.
- If the budget is exhausted, stop and deliver the best result so far plus what remains.

Finish with the result and the final ledger.`,
    isPinned: false,
    sortOrder: 3,
    createdAt: NOW,
    updatedAt: NOW,
    isBuiltIn: true,
  },
]

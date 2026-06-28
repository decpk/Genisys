import { useState, useRef, useEffect, useCallback } from 'react'

import { useSettingsStore } from '@/store/settings-store'
import { useLibraryStore, type BookWithChapters } from '@/store/library-store'
import { bookCache, invalidateBookCache } from '@/store/library-cache'
import { DEFAULT_LANGUAGE, type Language } from '@/lib/languages'
import { getLanguageLabel } from '@/lib/getLanguageLabel'

import {
  parseBookResponse,
  parseTocFromPlainText,
  type ParsedTocEntry,
} from './book-parser'
import { isArticleLength, type BookLength, type WebpageSource } from './book-prompt'
import { getBookSystemPrompt } from '@/prompts/libraryBookSystemPrompt'
import { persistChapterTranslation } from './utils/persistChapterTranslation'
import { markTranslationGenerating } from './utils/markTranslationGenerating'
import { cacheChapterImagesAfterGeneration } from './utils/cacheChapterImagesAfterGeneration'

type GenerationPhase =
  | 'idle'
  | 'generating-toc'
  | 'generating-chapter'
  | 'generating-translation'
  | 'done'
  | 'error'

/**
 * Tool options enabled for chapter generation. The `search_images` tool lets
 * the LLM look up permissively-licensed images on the web (Wikimedia Commons)
 * so chapters can include real, verified illustrations that the offline
 * cache can then download. TOC + translation phases do NOT use tools.
 */
const CHAPTER_GENERATION_TOOLS: { commandTools: string[]; enableTools: boolean } = {
  commandTools: ['search_images'],
  enableTools: true,
}

interface UseBookGeneratorReturn {
  phase: GenerationPhase;
  currentChapterIndex: number;
  totalChapters: number;
  streamingContent: string;
  error: string | null;
  sessionBookIds: Set<string>;
  /** Epoch ms when the active book's generation began (book mode). `null` when idle / not timed. */
  bookStartedAt: number | null;
  /** Epoch ms when the active book's currently-generating chapter began. `null` when no chapter is in flight. */
  chapterStartedAt: number | null;
  generateBook: (bookId: string, topic: string, bookLength?: BookLength, model?: string, source?: WebpageSource, language?: Language) => void;
  generateChapter: (bookId: string, chapterNumber: number) => void;
  generateAllChapters: (bookId: string, model?: string) => void;
  generateChapterTranslation: (bookId: string, chapterNumber: number, targetLanguage: Language) => void;
  generateBookTranslation: (bookId: string, targetLanguage: Language) => void;
  stopGeneration: () => void;
}

// ─── Per-book generation session ──

interface BookSession {
  bookId: string
  conversationId: string
  pendingChapters: number[]
  phase: GenerationPhase
  stopped: boolean
  content: string
  model: string
  title: string
  bookLength: BookLength
  source?: WebpageSource
  language: Language
  // When set, current generation is producing translations into chapter_translations
  // rather than writing to chapter.content.
  translationLanguage?: Language
  /** Epoch ms when this book's generation began. Set by generateBook / generateAllChapters; cleared once book duration is persisted. */
  bookStartedAt?: number
  /** Epoch ms when the current pending chapter began generating. Cleared on chapter completion. */
  chapterStartedAt?: number
}

// ─── Standalone helpers (no React hooks, safe to call anywhere) ──

/**
 * Resolve the latest book+chapters for the given `bookId` without depending on
 * which book the user is currently viewing. Resolution order:
 *   1. `activeBook` if its id matches (sync, free)
 *   2. LRU cache peek (sync, free, no LRU promotion)
 *   3. DB round-trip via `loadBookWithChapters` (slowest)
 *
 * This is the foundation that lets the generator run correctly for background
 * books — i.e. books that are mid-generation but not the one the user is
 * currently looking at in the sidebar.
 */
async function loadBookForGeneration(bookId: string): Promise<BookWithChapters | null> {
  const store = useLibraryStore.getState()
  if (store.activeBook && store.activeBook.book.id === bookId) {
    return store.activeBook
  }
  const cached = bookCache.peek(bookId)
  if (cached) return cached
  const fresh = (await window.api.loadBookWithChapters(bookId)) as BookWithChapters | null
  return fresh
}

async function buildChapterContext(bookId: string): Promise<string> {
  const book = await loadBookForGeneration(bookId)
  if (!book) return ''

  const sortedChapters = [...book.chapters].sort((a, b) => a.sortOrder - b.sortOrder)

  const tocLines = sortedChapters
    .map((c) => {
      const status = c.status === 'completed' ? '(completed)' : '(pending)'
      return `Chapter ${c.chapterNumber}: ${c.title} ${status}`
    })
    .join('\n')

  // Extract summaries from completed chapters for sub-agent continuity
  const completedSummaries = sortedChapters
    .filter((c) => c.status === 'completed' && c.content)
    .map((c) => {
      const summaryMatch = c.content.match(/<lib-summary\b[^>]*>([\s\S]*?)<\/lib-summary>/i)
      const summary = summaryMatch?.[1]?.trim() ?? 'Summary not available.'
      return `Chapter ${c.chapterNumber} (${c.title}):\n${summary}`
    })
    .join('\n\n')

  let context = `\nBook Title: ${book.book.title}\n`
  if (book.book.description) context += `Book Description: ${book.book.description}\n`
  context += `\nTable of Contents:\n${tocLines}\n`

  if (completedSummaries) {
    context += `\n────────────────────────────────────────\nPrevious Chapter Summaries (use for continuity — do NOT re-explain these concepts):\n────────────────────────────────────────\n${completedSummaries}\n`
  }

  context += '\n'
  return context
}

function sendToAICall(
  convId: string,
  userMessage: string,
  systemPrompt: string,
  streamIdMap: Map<string, string>,
  bookId: string,
  title: string,
  model?: string,
  options?: { commandTools?: string[]; enableTools?: boolean },
): string {
  const streamId = crypto.randomUUID()
  streamIdMap.set(streamId, bookId)

  window.api.appendChatMessage(convId, title, new Date().toISOString(), new Date().toISOString(), {
    id: crypto.randomUUID(),
    role: 'user',
    content: userMessage,
    timestamp: new Date().toISOString(),
  })

  window.api.sendChatMessage({
    streamId,
    conversationId: convId,
    model: model ?? useSettingsStore.getState().chatModel,
    systemPrompt,
    commandTools: options?.commandTools,
    enableTools: options?.enableTools,
  })

  return streamId
}

async function generateNextChapterCall(
  session: BookSession,
  streamIdMap: Map<string, string>,
  updateSessionPhase: (bookId: string, phase: GenerationPhase) => void,
  onChapterStarted: (bookId: string, startedAt: number | null) => void,
) {
  const nextChapterNum = session.pendingChapters[0];
  if (nextChapterNum === undefined) return;

  // Resolve chapter via bookId — works whether or not this book is currently
  // the active one in the sidebar.
  const store = useLibraryStore.getState();
  const data = await loadBookForGeneration(session.bookId);
  const chapter = data?.chapters.find((c) => c.chapterNumber === nextChapterNum);
  if (chapter) {
    // `updateChapterStatus` already handles the non-active-book case by
    // loading the chapter row from DB and merging the new status.
    await store.updateChapterStatus(chapter.id, "generating", session.bookId);
  }

  session.phase = 'generating-chapter'
  updateSessionPhase(session.bookId, 'generating-chapter')

  // Capture chapter generation start time for live timer + persisted duration.
  const startedAt = Date.now()
  session.chapterStartedAt = startedAt
  onChapterStarted(session.bookId, startedAt)

  const bookTitle = data?.book.title ?? 'Book'
  session.title = `${bookTitle} — Ch.${nextChapterNum}: ${chapter?.title ?? ''}`

  // Sub-agent isolation: fresh conversation for each chapter
  session.conversationId = crypto.randomUUID()
  session.content = ''

  const context = await buildChapterContext(session.bookId)

  sendToAICall(
    session.conversationId,
    `${context}Generate Chapter ${nextChapterNum} now. Wrap the chapter in <lib-chapter number="${nextChapterNum}"> ... </lib-chapter>. Follow the mandatory chapter output format.`,
    getBookSystemPrompt(session.bookLength, session.source, session.translationLanguage ?? session.language),
    streamIdMap,
    session.bookId,
    session.title,
    session.model,
    CHAPTER_GENERATION_TOOLS,
  );
}

async function handleTocResponseCall(
  session: BookSession,
  content: string,
  streamIdMap: Map<string, string>,
  updateSessionPhase: (bookId: string, phase: GenerationPhase) => void,
  setError: (e: string | null) => void,
  onTotalChaptersUpdate: (bookId: string, n: number) => void,
  onChapterStarted: (bookId: string, startedAt: number | null) => void,
) {
  const parsed = parseBookResponse(content);
  let tocEntries: ParsedTocEntry[] = parsed.toc ?? [];

  if (tocEntries.length === 0) {
    tocEntries = parseTocFromPlainText(content);
  }

  if (tocEntries.length === 0) {
    session.phase = 'error'
    updateSessionPhase(session.bookId, 'error')
    setError("Could not parse table of contents from AI response");
    useLibraryStore.getState().updateBookStatus(session.bookId, "error");
    // TOC parse failed — generation is over, release eviction protection.
    useLibraryStore.getState().clearBookGenerating(session.bookId)
    return;
  }

  const store = useLibraryStore.getState();
  for (const entry of tocEntries) {
    await store.addChapter({
      bookId: session.bookId,
      chapterNumber: entry.chapterNumber,
      title: entry.title,
      content: "",
      status: "pending",
      sortOrder: entry.chapterNumber,
      isRead: false,
      language: session.language,
    });
  }

  onTotalChaptersUpdate(session.bookId, tocEntries.length)

  // Reload the book so the sidebar updates if this book is currently active.
  // For background books, `reloadBook` is a no-op — and `addChapter` only
  // updated the LRU cache when the book was active. To prevent the user from
  // seeing a stale (chapter-less) snapshot when they switch back to this
  // book, invalidate its cache entry so the next `selectBook` re-loads from
  // DB.
  if (useLibraryStore.getState().activeBookId === session.bookId) {
    await store.reloadBook(session.bookId);
  } else {
    invalidateBookCache(session.bookId);
  }

  // Auto-generate all chapters sequentially
  session.pendingChapters = tocEntries.map((e) => e.chapterNumber);
  void generateNextChapterCall(session, streamIdMap, updateSessionPhase, onChapterStarted);
}

async function handleChapterResponseCall(
  session: BookSession,
  content: string,
  streamIdMap: Map<string, string>,
  updateSessionPhase: (bookId: string, phase: GenerationPhase) => void,
  onChapterCompleted: (bookId: string) => void,
  onStreamingContent: (bookId: string, content: string) => void,
  onChapterStarted: (bookId: string, startedAt: number | null) => void,
  onBookStarted: (bookId: string, startedAt: number | null) => void,
) {
  const parsed = parseBookResponse(content);
  const store = useLibraryStore.getState();

  // Compute the chapter's generation duration from the start time we captured
  // when this chapter began. We snapshot now so the value isn't affected by
  // the async work below.
  const chapterEndedAt = Date.now()
  const chapterDurationMs =
    session.chapterStartedAt !== undefined
      ? Math.max(0, chapterEndedAt - session.chapterStartedAt)
      : null

  // Reload the book data to get fresh chapters
  const freshData = (await window.api.loadBookWithChapters(session.bookId)) as BookWithChapters | null;
  const chapters = freshData?.chapters ?? [];

  // Track which chapter rows we just marked completed so we can persist the
  // single recorded duration onto exactly the one chapter this stream produced.
  let completedChapterId: string | null = null

  if (parsed.chapters.length > 0) {
    for (const ch of parsed.chapters) {
      const existing = chapters.find(
        (c) => c.chapterNumber === ch.chapterNumber,
      );
      if (existing) {
        await store.updateChapterContent(existing.id, ch.content, session.bookId);
        await store.updateChapterStatus(existing.id, "completed", session.bookId);
        completedChapterId = existing.id
        // Fire-and-forget: download referenced images, rewrite to offline
        // URLs, and append the image-credits block. Persist the rewritten
        // markdown back to the same chapter row.
        const cacheEnabled = useSettingsStore.getState().libraryCacheImagesForOffline !== false
        void cacheChapterImagesAfterGeneration({
          bookId: session.bookId,
          chapterId: existing.id,
          markdown: ch.content,
          enabled: cacheEnabled,
          persist: (rewritten) => store.updateChapterContent(existing.id, rewritten, session.bookId),
        })
      }
    }
  } else {
    const chapterNum = session.pendingChapters[0];
    if (chapterNum !== undefined) {
      const existing = chapters.find(
        (c) => c.chapterNumber === chapterNum,
      );
      if (existing) {
        await store.updateChapterContent(existing.id, content, session.bookId);
        await store.updateChapterStatus(existing.id, "completed", session.bookId);
        completedChapterId = existing.id
        const cacheEnabled = useSettingsStore.getState().libraryCacheImagesForOffline !== false
        void cacheChapterImagesAfterGeneration({
          bookId: session.bookId,
          chapterId: existing.id,
          markdown: content,
          enabled: cacheEnabled,
          persist: (rewritten) => store.updateChapterContent(existing.id, rewritten, session.bookId),
        })
      }
    }
  }

  // Persist chapter generation duration (one stream = one chapter).
  if (completedChapterId !== null && chapterDurationMs !== null) {
    await store.updateChapterTiming(completedChapterId, chapterDurationMs, session.bookId)
  }
  // Clear the chapter timer regardless — it's consumed.
  session.chapterStartedAt = undefined
  onChapterStarted(session.bookId, null)

  session.pendingChapters = session.pendingChapters.slice(1);
  onChapterCompleted(session.bookId);

  if (session.pendingChapters.length > 0 && !session.stopped) {
    // Refresh data for the next chapter's context. If this book is active in
    // the sidebar, run the full `reloadBook` (also refreshes UI). Otherwise,
    // just warm the LRU cache directly with the fresh data we already loaded —
    // `loadBookForGeneration` will pick this up on the next chapter and the
    // user will see fresh data the moment they switch to this book.
    if (useLibraryStore.getState().activeBookId === session.bookId) {
      await store.reloadBook(session.bookId);
    } else if (freshData) {
      bookCache.set(session.bookId, freshData);
    }
    void generateNextChapterCall(session, streamIdMap, updateSessionPhase, onChapterStarted);
  } else {
    // Persist total book duration only if this session tracked one (i.e.
    // `generateBook` or `generateAllChapters`; single-chapter retries via
    // `generateChapter` deliberately don't set `bookStartedAt`).
    if (session.bookStartedAt !== undefined) {
      const bookDurationMs = Math.max(0, Date.now() - session.bookStartedAt)
      await store.updateBookTiming(session.bookId, bookDurationMs)
      session.bookStartedAt = undefined
      onBookStarted(session.bookId, null)
    }

    session.phase = 'done'
    updateSessionPhase(session.bookId, 'done')
    onStreamingContent(session.bookId, '')
    session.content = ''
    await store.updateBookStatus(session.bookId, "completed");
    // Generation finished cleanly — release eviction protection for this book.
    store.clearBookGenerating(session.bookId)
  }
}

// ─── Hook ────────────────────────────────────────────────────────

export function useBookGenerator(): UseBookGeneratorReturn {
  const [phase, setPhase] = useState<GenerationPhase>('idle')
  const [streamingContent, setStreamingContent] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0)
  const [totalChapters, setTotalChapters] = useState(0)
  // Epoch-ms timestamps for the *currently-viewed* book's generation.
  // `null` means “not timed” (idle, or no in-flight chapter).
  const [bookStartedAt, setBookStartedAt] = useState<number | null>(null)
  const [chapterStartedAt, setChapterStartedAt] = useState<number | null>(null)

  // Per-book session tracking
  const sessionsRef = useRef<Map<string, BookSession>>(new Map())
  // streamId → bookId mapping for routing SSE events
  const streamIdMap = useRef<Map<string, string>>(new Map())
  // Track which book's progress is shown in the UI
  const activeGenBookIdRef = useRef<string | null>(null)
  const [sessionBookIds, setSessionBookIds] = useState<Set<string>>(new Set())

  // Update UI state for the currently-viewed generation
  const updateSessionPhase = useCallback((bookId: string, newPhase: GenerationPhase) => {
    if (activeGenBookIdRef.current === bookId) {
      setPhase(newPhase)
    }
  }, [])

  const onTotalChaptersUpdate = useCallback((bookId: string, n: number) => {
    if (activeGenBookIdRef.current === bookId) {
      setTotalChapters(n)
    }
  }, [])

  const onChapterCompleted = useCallback((bookId: string) => {
    if (activeGenBookIdRef.current === bookId) {
      setCurrentChapterIndex((prev) => prev + 1)
    }
  }, [])

  const onStreamingContent = useCallback((bookId: string, content: string) => {
    if (activeGenBookIdRef.current === bookId) {
      setStreamingContent(content)
    }
  }, [])

  const onChapterStarted = useCallback((bookId: string, startedAt: number | null) => {
    if (activeGenBookIdRef.current === bookId) {
      setChapterStartedAt(startedAt)
    }
  }, [])

  const onBookStarted = useCallback((bookId: string, startedAt: number | null) => {
    if (activeGenBookIdRef.current === bookId) {
      setBookStartedAt(startedAt)
    }
  }, [])

  // ─── Sync UI to currently-selected book ─────────────────────
  const activeBookId = useLibraryStore((s) => s.activeBookId)
  useEffect(() => {
    if (!activeBookId) return
    const session = sessionsRef.current.get(activeBookId)
    if (session) {
      // This book has a generation session — show its state
      activeGenBookIdRef.current = activeBookId
      setPhase(session.phase)
      setStreamingContent(session.content)
      setBookStartedAt(session.bookStartedAt ?? null)
      setChapterStartedAt(session.chapterStartedAt ?? null)
    } else {
      // No active generation for this book — reset UI
      activeGenBookIdRef.current = activeBookId
      setPhase('idle')
      setStreamingContent('')
      setCurrentChapterIndex(0)
      setTotalChapters(0)
      setBookStartedAt(null)
      setChapterStartedAt(null)
      setError(null)
    }
  }, [activeBookId])

  // ─── SSE stream listeners ─────────────────────────────────────
  useEffect(() => {
    const cleanupChunk = window.api.onChatStreamChunk(
      ({ streamId, token }: { streamId: string; token: string }) => {
        const bookId = streamIdMap.current.get(streamId)
        if (!bookId) return
        const session = sessionsRef.current.get(bookId)
        if (!session) return
        session.content += token
        if (activeGenBookIdRef.current === bookId) {
          setStreamingContent(session.content)
        }
      }
    )

    const cleanupDone = window.api.onChatStreamDone(
      ({ streamId }: { streamId: string }) => {
        const bookId = streamIdMap.current.get(streamId)
        if (!bookId) return
        const session = sessionsRef.current.get(bookId)
        if (!session) return

        // Clean up the streamId mapping
        streamIdMap.current.delete(streamId)

        const content = session.content
        const currentPhase = session.phase

        // Save assistant response
        window.api.appendChatMessage(session.conversationId, session.title, new Date().toISOString(), new Date().toISOString(), {
          id: crypto.randomUUID(),
          role: 'assistant',
          content,
          timestamp: new Date().toISOString(),
        })

        if (currentPhase === 'generating-toc') {
          handleTocResponseCall(
            session,
            content,
            streamIdMap.current,
            updateSessionPhase,
            setError,
            onTotalChaptersUpdate,
            onChapterStarted,
          );
        } else if (currentPhase === 'generating-translation') {
          (async () => {
            const chapterNumber = session.pendingChapters[0]
            const targetLang = session.translationLanguage
            if (targetLang !== undefined && chapterNumber !== undefined) {
              await persistChapterTranslation(session.bookId, content, chapterNumber, targetLang)
            }
            session.pendingChapters = session.pendingChapters.slice(1)
            onChapterCompleted(session.bookId)

            if (session.pendingChapters.length > 0 && !session.stopped && targetLang) {
              // Continue with the next chapter translation
              const store = useLibraryStore.getState()
              const nextNum = session.pendingChapters[0]
              const chapter = store.activeBook?.chapters.find((c) => c.chapterNumber === nextNum)
              if (chapter) {
                await markTranslationGenerating(chapter.id, targetLang)
              }
              session.conversationId = crypto.randomUUID()
              session.content = ''
              const sourceContent = chapter?.content ?? ''
              const langLabel = getLanguageLabel(targetLang)
              const userMessage = `Translate the following chapter into ${langLabel}. Preserve all Markdown structure, code blocks (untranslated), and all lib-* block tags (translate only their visible text). Output the translated chapter wrapped in <lib-chapter number="${nextNum}"> ... </lib-chapter>.\n\n===SOURCE_CHAPTER===\n${sourceContent}\n===END_SOURCE_CHAPTER===`
              sendToAICall(
                session.conversationId,
                userMessage,
                getBookSystemPrompt(session.bookLength, session.source, targetLang),
                streamIdMap.current,
                session.bookId,
                session.title,
                session.model,
              )
            } else {
              session.phase = 'done'
              updateSessionPhase(session.bookId, 'done')
              onStreamingContent(session.bookId, '')
              session.content = ''
              session.translationLanguage = undefined
              // Translation run finished — release eviction protection.
              useLibraryStore.getState().clearBookGenerating(session.bookId)
            }
          })()
        } else if (currentPhase === 'generating-chapter') {
          handleChapterResponseCall(
            session,
            content,
            streamIdMap.current,
            updateSessionPhase,
            onChapterCompleted,
            onStreamingContent,
            onChapterStarted,
            onBookStarted,
          );
        }
      }
    )

    const cleanupError = window.api.onChatStreamError(
      ({ streamId, error: errMsg }: { streamId: string; error: string }) => {
        const bookId = streamIdMap.current.get(streamId)
        if (!bookId) return
        const session = sessionsRef.current.get(bookId)
        streamIdMap.current.delete(streamId)

        if (session) {
          session.phase = 'error'
          // Discard timing on error — we deliberately don't persist a
          // partial duration.
          session.chapterStartedAt = undefined
        }
        if (activeGenBookIdRef.current === bookId) {
          setPhase('error')
          setError(errMsg)
          setChapterStartedAt(null)
        }
        useLibraryStore.getState().updateBookStatus(bookId, 'error')
        // Clears even on the error path so the book never stays pinned as
        // "generating" after a failed run.
        useLibraryStore.getState().clearBookGenerating(bookId)
      }
    )

    return () => {
      cleanupChunk()
      cleanupDone()
      cleanupError()
    }
  }, [updateSessionPhase, onTotalChaptersUpdate, onChapterCompleted, onStreamingContent, onChapterStarted, onBookStarted])

  // ─── Helpers ──────────────────────────────────────────────────

  const getOrCreateSession = useCallback((bookId: string, model?: string): BookSession => {
    let session = sessionsRef.current.get(bookId)
    if (!session) {
      // If no model provided, try to read it from the persisted book data
      const resolvedModel = model
        || useLibraryStore.getState().activeBook?.book.model
        || useSettingsStore.getState().chatModel
      session = {
        bookId,
        conversationId: crypto.randomUUID(),
        pendingChapters: [],
        phase: 'idle',
        stopped: false,
        content: '',
        model: resolvedModel,
        title: 'Book Generation',
        bookLength: 'medium',
        language: useLibraryStore.getState().activeBook?.book.language ?? DEFAULT_LANGUAGE,
      }
      sessionsRef.current.set(bookId, session)
    } else if (model) {
      session.model = model
    }
    return session
  }, [])

  const activateBookUI = useCallback((bookId: string, session: BookSession) => {
    activeGenBookIdRef.current = bookId
    // Single chokepoint for "a generation started" — every public generator
    // (book / article / chapter / translation) funnels through here. Mark the
    // book generating so eviction protection covers it even while it runs in the
    // background; it is cleared on every terminal transition (done/error/stop).
    useLibraryStore.getState().markBookGenerating(bookId)
    setSessionBookIds((prev) => new Set(prev).add(bookId))
    setPhase(session.phase)
    setStreamingContent(session.content)
    setBookStartedAt(session.bookStartedAt ?? null)
    setChapterStartedAt(session.chapterStartedAt ?? null)
    setError(null)
  }, [])

  // ─── Public API ───────────────────────────────────────────────

  const generateBook = useCallback((bookId: string, topic: string, bookLength: BookLength = 'medium', model?: string, source?: WebpageSource, language: Language = DEFAULT_LANGUAGE) => {
    const session = getOrCreateSession(bookId, model)
    session.stopped = false
    session.content = ''
    session.conversationId = crypto.randomUUID()
    session.bookLength = bookLength
    session.source = source
    session.language = language
    session.translationLanguage = undefined

    // Start the total-book timer for a fresh run.
    const bookStart = Date.now()
    session.bookStartedAt = bookStart
    session.chapterStartedAt = undefined

    if (isArticleLength(bookLength)) {
      // Article mode: single-chapter, skip TOC phase
      session.phase = 'generating-chapter'
      session.title = `Article: ${topic}`
      session.pendingChapters = [1]
      // In article mode the single chapter starts immediately, so seed the
      // chapter timer with the same start.
      session.chapterStartedAt = bookStart

      activateBookUI(bookId, session)
      setCurrentChapterIndex(0)
      setTotalChapters(1)

      // Create the single chapter placeholder
      const store = useLibraryStore.getState()
      store.addChapter({
        bookId,
        chapterNumber: 1,
        title: topic,
        content: '',
        status: 'generating',
        sortOrder: 1,
        isRead: false,
        language,
      }).then(() => {
        const userMessage = source
          ? `Write an article based on the SOURCE MATERIAL provided in the system prompt. Topic: ${topic}\n\nGenerate the complete article content. Preserve the source's natural section order. Wrap the output in <lib-chapter number="1"> ... </lib-chapter>.`
          : `Write an article about: ${topic}\n\nGenerate the complete article content. Wrap the output in <lib-chapter number="1"> ... </lib-chapter>.`
        sendToAICall(
          session.conversationId,
          userMessage,
          getBookSystemPrompt(bookLength, source, language),
          streamIdMap.current,
          bookId,
          session.title,
          session.model,
          CHAPTER_GENERATION_TOOLS,
        )
      })
    } else {
      // Book mode: two-phase orchestrator + sub-agent
      session.phase = 'generating-toc'
      session.title = `Book: ${topic}`

      activateBookUI(bookId, session)
      setCurrentChapterIndex(0)
      setTotalChapters(0)

      const userMessage = source
        ? `Generate a complete book based on the SOURCE MATERIAL provided in the system prompt. Topic: ${topic}\n\nAuto-detect the book type from the source and adapt your style accordingly. The Table of Contents MUST follow the natural section order of the source page. Create the Table of Contents first using the ===TOC_START=== and ===TOC_END=== delimiters. Include ===BOOK_META=== at the top with the book_type field.`
        : `Generate a complete book about: ${topic}\n\nAuto-detect the book type from the topic and adapt your style accordingly. Please create the Table of Contents first using the ===TOC_START=== and ===TOC_END=== delimiters. Include ===BOOK_META=== at the top with the book_type field.`

      sendToAICall(
        session.conversationId,
        userMessage,
        getBookSystemPrompt(bookLength, source, language),
        streamIdMap.current,
        bookId,
        session.title,
        session.model,
      );
    }
  }, [getOrCreateSession, activateBookUI]);

  const generateChapter = useCallback(
    (bookId: string, chapterNumber: number) => {
      const session = getOrCreateSession(bookId)
      session.stopped = false
      session.phase = 'generating-chapter'
      session.content = ''
      session.pendingChapters = [chapterNumber]
      // Single-chapter retry: track only this chapter, not the whole book.
      // Leaving `bookStartedAt` unset means handleChapterResponseCall will
      // skip persisting a book duration when this run completes.
      const startedAt = Date.now()
      session.chapterStartedAt = startedAt
      session.bookStartedAt = undefined

      activateBookUI(bookId, session)
      setCurrentChapterIndex(0)
      setTotalChapters(1)

      const store = useLibraryStore.getState()
      const chapter = store.activeBook?.chapters.find(
        (c) => c.chapterNumber === chapterNumber
      )
      if (chapter) {
        store.updateChapterStatus(chapter.id, 'generating', bookId)
      }

      // Sub-agent isolation: fresh conversation for each chapter
      session.conversationId = crypto.randomUUID()

      const context = buildChapterContext(bookId)
      const bookTitle = store.activeBook?.book.title ?? 'Book'
      session.title = `${bookTitle} — Ch.${chapterNumber}: ${chapter?.title ?? ''}`

      sendToAICall(
        session.conversationId,
        `${context}Generate Chapter ${chapterNumber} now. Wrap the chapter in <lib-chapter number="${chapterNumber}"> ... </lib-chapter>. Follow the mandatory chapter output format.`,
        getBookSystemPrompt(session.bookLength, session.source, session.translationLanguage ?? session.language),
        streamIdMap.current,
        bookId,
        session.title,
        session.model,
        CHAPTER_GENERATION_TOOLS,
      )
    },
    [getOrCreateSession, activateBookUI]
  )

  const generateAllChapters = useCallback(
    (bookId: string, model?: string) => {
      const session = getOrCreateSession(bookId, model)
      session.stopped = false

      const store = useLibraryStore.getState()
      const book = store.activeBook
      if (!book) return

      const pending = book.chapters
        .filter((c) => c.status === 'pending' || c.status === 'error' || c.status === 'generating')
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((c) => c.chapterNumber)

      if (pending.length === 0) return

      session.pendingChapters = pending
      session.phase = 'generating-chapter'
      session.content = ''
      session.title = book.book.title ?? 'Book Generation'
      // Seed the book timer if a fresh run — keep an existing one if this is
      // a continuation within the same session.
      if (session.bookStartedAt === undefined) {
        session.bookStartedAt = Date.now()
      }

      const completedCount = book.chapters.filter((c) => c.status === 'completed').length

      activateBookUI(bookId, session)
      setTotalChapters(book.chapters.length)
      setCurrentChapterIndex(completedCount)

      void generateNextChapterCall(session, streamIdMap.current, updateSessionPhase, onChapterStarted)
    },
    [getOrCreateSession, activateBookUI, updateSessionPhase, onChapterStarted]
  )

  const generateChapterTranslation = useCallback(
    (bookId: string, chapterNumber: number, targetLanguage: Language) => {
      const session = getOrCreateSession(bookId)
      session.stopped = false
      session.phase = 'generating-translation'
      session.translationLanguage = targetLanguage
      session.content = ''
      session.pendingChapters = [chapterNumber]
      session.conversationId = crypto.randomUUID()

      const store = useLibraryStore.getState()
      const chapter = store.activeBook?.chapters.find((c) => c.chapterNumber === chapterNumber)
      const bookTitle = store.activeBook?.book.title ?? 'Book'
      const langLabel = getLanguageLabel(targetLanguage)
      session.title = `${bookTitle} — Ch.${chapterNumber} → ${langLabel}`

      activateBookUI(bookId, session)
      setCurrentChapterIndex(0)
      setTotalChapters(1)

      if (!chapter) {
        // Nothing to translate — undo the marker activateBookUI just set,
        // otherwise this book would stay pinned as generating with no stream to
        // ever clear it.
        useLibraryStore.getState().clearBookGenerating(bookId)
        return
      }
      void markTranslationGenerating(chapter.id, targetLanguage).then(() => {
        const sourceContent = chapter.content ?? ''
        const userMessage = `Translate the following chapter into ${langLabel}. Preserve all Markdown structure, code blocks (untranslated), and all lib-* block tags (translate only their visible text). Output the translated chapter wrapped in <lib-chapter number="${chapterNumber}"> ... </lib-chapter>.\n\n===SOURCE_CHAPTER===\n${sourceContent}\n===END_SOURCE_CHAPTER===`
        sendToAICall(
          session.conversationId,
          userMessage,
          getBookSystemPrompt(session.bookLength, session.source, targetLanguage),
          streamIdMap.current,
          bookId,
          session.title,
          session.model,
        )
      })
    },
    [getOrCreateSession, activateBookUI],
  )

  const generateBookTranslation = useCallback(
    (bookId: string, targetLanguage: Language) => {
      const session = getOrCreateSession(bookId)
      session.stopped = false
      session.phase = 'generating-translation'
      session.translationLanguage = targetLanguage
      session.content = ''
      session.conversationId = crypto.randomUUID()

      const store = useLibraryStore.getState()
      const book = store.activeBook
      if (!book) return

      const completed = book.chapters
        .filter((c) => c.status === 'completed' && c.content)
        .sort((a, b) => a.sortOrder - b.sortOrder)
      if (completed.length === 0) return

      session.pendingChapters = completed.map((c) => c.chapterNumber)
      const langLabel = getLanguageLabel(targetLanguage)
      session.title = `${book.book.title} → ${langLabel}`

      activateBookUI(bookId, session)
      setTotalChapters(completed.length)
      setCurrentChapterIndex(0)

      const first = completed[0]
      void markTranslationGenerating(first.id, targetLanguage).then(() => {
        const userMessage = `Translate the following chapter into ${langLabel}. Preserve all Markdown structure, code blocks (untranslated), and all lib-* block tags (translate only their visible text). Output the translated chapter wrapped in <lib-chapter number="${first.chapterNumber}"> ... </lib-chapter>.\n\n===SOURCE_CHAPTER===\n${first.content}\n===END_SOURCE_CHAPTER===`
        sendToAICall(
          session.conversationId,
          userMessage,
          getBookSystemPrompt(session.bookLength, session.source, targetLanguage),
          streamIdMap.current,
          bookId,
          session.title,
          session.model,
        )
      })
    },
    [getOrCreateSession, activateBookUI],
  )

  const stopGeneration = useCallback(() => {
    // Stop the currently active book's generation
    const bookId = activeGenBookIdRef.current
    if (bookId) {
      const session = sessionsRef.current.get(bookId)
      if (session) {
        session.stopped = true
        // Discard partial timing — we don't persist durations for stopped
        // chapters / books.
        session.chapterStartedAt = undefined
        session.bookStartedAt = undefined
      }
      // User stopped — release eviction protection for this book.
      useLibraryStore.getState().clearBookGenerating(bookId)
      // Abort all streams for this book
      for (const [sid, bid] of streamIdMap.current.entries()) {
        if (bid === bookId) {
          window.api.abortChatStream(sid)
          streamIdMap.current.delete(sid)
        }
      }
    }
    setPhase('idle')
    setStreamingContent('')
    setBookStartedAt(null)
    setChapterStartedAt(null)
  }, [])

  return {
    phase,
    currentChapterIndex,
    totalChapters,
    streamingContent,
    error,
    sessionBookIds,
    bookStartedAt,
    chapterStartedAt,
    generateBook,
    generateChapter,
    generateAllChapters,
    generateChapterTranslation,
    generateBookTranslation,
    stopGeneration,
  }
}
